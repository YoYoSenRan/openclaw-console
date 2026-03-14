import type { LocalSession } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { BaseService } from "../../base/base.service";
import { resolveClaudeHome } from "../../../utils/path";

/**
 * Claude 消息日志解析接口
 */
interface ClaudeMessage {
  type: "user" | "assistant";
  sessionId: string;
  timestamp?: string;
  message?: {
    role?: string;
    content?: unknown;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
  cwd?: string;
  gitBranch?: string;
  isSidechain?: boolean;
}

/**
 * Claude 会话统计信息
 */
export interface SessionStats {
  sessionId: string;
  projectSlug: string;
  projectPath: string | null;
  model: string | null;
  gitBranch: string | null;
  userMessages: number;
  assistantMessages: number;
  toolUses: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  firstMessageAt: Date | null;
  lastMessageAt: Date | null;
  lastUserPrompt: string | null;
  isActive: boolean;
}

/**
 * 对话消息记录
 */
export interface TranscriptMessage {
  type: "user" | "assistant";
  timestamp: string | null;
  content: unknown;
  model?: string;
}

/**
 * 同步结果
 */
export interface SyncResult {
  upserted: number;
  skipped: number;
}

/**
 * 同步节流时间间隔（毫秒）
 */
const THROTTLE_MS = 30_000;

/**
 * Claude 会话发现服务
 * 负责扫描、解析、同步 Claude Code 本地会话数据
 */
@Injectable()
export class ClaudeSessionsService extends BaseService<LocalSession> {
  private lastSyncAt = 0;
  private lastResult: SyncResult | null = null;

  protected get delegate() {
    return this.prisma.localSession;
  }

  /**
   * 扫描本地 Claude 会话
   * 读取 ~/.claude/projects 目录下的 jsonl 文件并解析会话统计
   */
  scan(): SessionStats[] {
    const projectsDir = path.join(resolveClaudeHome(), "projects");
    if (!fs.existsSync(projectsDir)) return [];

    const results: SessionStats[] = [];

    for (const projectSlug of fs.readdirSync(projectsDir)) {
      const projectDir = path.join(projectsDir, projectSlug);
      if (!fs.statSync(projectDir).isDirectory()) continue;

      for (const file of fs.readdirSync(projectDir).filter((f) => f.endsWith(".jsonl"))) {
        const stats = this.parseJsonl(path.join(projectDir, file), projectSlug);
        if (stats) results.push(stats);
      }
    }

    return results;
  }

  /**
   * 同步会话到数据库
   * 将扫描到的会话数据持久化，支持强制刷新
   */
  async sync(force = false): Promise<SyncResult> {
    const now = Date.now();
    if (!force && this.lastResult && now - this.lastSyncAt < THROTTLE_MS) {
      return this.lastResult;
    }

    const sessions = this.scan();
    let upserted = 0;

    for (const s of sessions) {
      const payload = {
        source: "claude",
        projectSlug: s.projectSlug,
        projectPath: s.projectPath,
        model: s.model,
        gitBranch: s.gitBranch,
        userMessages: s.userMessages,
        assistantMessages: s.assistantMessages,
        toolUses: s.toolUses,
        inputTokens: s.inputTokens,
        outputTokens: s.outputTokens,
        estimatedCost: s.estimatedCost,
        firstMessageAt: s.firstMessageAt,
        lastMessageAt: s.lastMessageAt,
        lastUserPrompt: s.lastUserPrompt,
        isActive: s.isActive,
      };
      await this.prisma.localSession.upsert({
        where: { id: s.sessionId },
        create: { id: s.sessionId, ...payload },
        update: payload,
      });
      upserted++;
    }

    this.lastSyncAt = now;
    this.lastResult = { upserted, skipped: 0 };
    return this.lastResult;
  }

  /**
   * 读取会话对话记录
   * @param sessionId - 会话 ID
   * @param limit - 返回最近的消息数量，默认 40 条
   */
  readTranscript(sessionId: string, limit = 40): TranscriptMessage[] {
    const projectsDir = path.join(resolveClaudeHome(), "projects");
    if (!fs.existsSync(projectsDir)) return [];

    for (const projectSlug of fs.readdirSync(projectsDir)) {
      const candidate = path.join(projectsDir, projectSlug, `${sessionId}.jsonl`);
      if (fs.existsSync(candidate)) {
        return this.parseTranscript(candidate, limit);
      }
    }
    return [];
  }

  /**
   * 解析 jsonl 文件获取会话统计
   */
  private parseJsonl(filePath: string, projectSlug: string): SessionStats | null {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    if (lines.length === 0) return null;

    let sessionId: string | null = null;
    let projectPath: string | null = null;
    let model: string | null = null;
    let gitBranch: string | null = null;
    let userMessages = 0;
    let assistantMessages = 0;
    let toolUses = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let firstMessageAt: Date | null = null;
    let lastMessageAt: Date | null = null;
    let lastUserPrompt: string | null = null;

    for (const line of lines) {
      let msg: ClaudeMessage;
      try {
        msg = JSON.parse(line) as ClaudeMessage;
      } catch {
        continue;
      }

      if (!sessionId && msg.sessionId) sessionId = msg.sessionId;
      if (!projectPath && msg.cwd) projectPath = msg.cwd;
      if (!gitBranch && msg.gitBranch) gitBranch = msg.gitBranch;

      const ts = msg.timestamp ? new Date(msg.timestamp) : null;
      if (ts) {
        if (!firstMessageAt || ts < firstMessageAt) firstMessageAt = ts;
        if (!lastMessageAt || ts > lastMessageAt) lastMessageAt = ts;
      }

      if (msg.type === "user" && !msg.isSidechain) {
        userMessages++;
        const text = extractText(msg.message?.content);
        if (text) lastUserPrompt = text.slice(0, 500);
      }

      if (msg.type === "assistant") {
        assistantMessages++;
        if (msg.message?.usage) {
          inputTokens += msg.message.usage.input_tokens ?? 0;
          outputTokens += msg.message.usage.output_tokens ?? 0;
        }
        if (!model) {
          const raw = msg as unknown as Record<string, unknown>;
          if (typeof raw.model === "string") model = raw.model;
        }
        if (Array.isArray(msg.message?.content)) {
          toolUses += (msg.message!.content as unknown[]).filter(
            (b) =>
              typeof b === "object" &&
              b !== null &&
              (b as Record<string, string>).type === "tool_use",
          ).length;
        }
      }
    }

    if (!sessionId) sessionId = path.basename(filePath, ".jsonl");

    return {
      sessionId,
      projectSlug,
      projectPath,
      model,
      gitBranch,
      userMessages,
      assistantMessages,
      toolUses,
      inputTokens,
      outputTokens,
      estimatedCost: inputTokens * 0.000003 + outputTokens * 0.000015,
      firstMessageAt,
      lastMessageAt,
      lastUserPrompt,
      isActive: false,
    };
  }

  /**
   * 解析 jsonl 文件获取对话记录
   */
  private parseTranscript(filePath: string, limit: number): TranscriptMessage[] {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const messages: TranscriptMessage[] = [];

    for (const line of lines) {
      let msg: ClaudeMessage;
      try {
        msg = JSON.parse(line) as ClaudeMessage;
      } catch {
        continue;
      }

      if (msg.type !== "user" && msg.type !== "assistant") continue;
      if (msg.isSidechain) continue;

      const raw = msg as unknown as Record<string, unknown>;
      messages.push({
        type: msg.type,
        timestamp: msg.timestamp ?? null,
        content: msg.message?.content ?? null,
        model: typeof raw.model === "string" ? raw.model : undefined,
      });
    }

    return messages.slice(-limit);
  }
}

/**
 * 从消息内容中提取纯文本
 */
function extractText(content: unknown): string | null {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === "object" && item !== null) {
        const block = item as Record<string, unknown>;
        if (block.type === "text" && typeof block.text === "string") return block.text;
      }
    }
  }
  return null;
}
