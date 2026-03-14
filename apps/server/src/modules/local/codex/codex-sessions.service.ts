import type { LocalSession } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { BaseService } from "../../base/base.service";
import { resolveCodexHome } from "../../../utils/path";

/**
 * Codex 会话元数据
 * 包含会话ID、项目路径、模型和Git分支信息
 */
interface CodexSessionMeta {
  type: "session_meta";
  timestamp: string;
  payload: {
    id: string;
    cwd?: string;
    model?: string;
    git?: { branch?: string };
  };
}

/**
 * Codex 响应条目
 * 包含用户/助手消息、工具调用和使用统计
 */
interface CodexResponseItem {
  type: "response_item";
  timestamp: string;
  payload: {
    type?: string;
    role?: string;
    content?: unknown;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
}

/**
 * Codex 事件消息
 * 通用的事件消息类型
 */
interface CodexEventMsg {
  type: "event_msg";
  timestamp: string;
  payload: unknown;
}

/**
 * Codex JSONL 行数据的联合类型
 */
type CodexLine = CodexSessionMeta | CodexResponseItem | CodexEventMsg;

/**
 * Codex 会话统计数据
 * 从本地会话文件解析得出的结构化会话信息
 */
export interface CodexSessionStats {
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
 * 转录消息
 * 从会话文件中提取的对话消息
 */
export interface TranscriptMessage {
  type: string;
  timestamp: string | null;
  content: unknown;
}

/**
 * 同步结果
 * 包含插入/更新和跳过的记录数
 */
export interface SyncResult {
  upserted: number;
  skipped: number;
}

/**
 * 同步节流时间间隔（毫秒）
 * 防止频繁同步操作
 */
const THROTTLE_MS = 30_000;

/**
 * Codex 会话发现服务
 * 负责扫描、解析、同步 Codex 本地会话数据
 */
@Injectable()
export class CodexSessionsService extends BaseService<LocalSession> {
  private lastSyncAt = 0;
  private lastResult: SyncResult | null = null;

  /**
   * 获取数据库代理对象
   */
  protected get delegate() {
    return this.prisma.localSession;
  }

  /**
   * 扫描本地 Codex 会话
   * 读取 ~/.codex/sessions 目录下的 jsonl 文件并解析会话统计
   * @returns Codex 会话统计数组
   */
  scan(): CodexSessionStats[] {
    const sessionsDir = path.join(resolveCodexHome(), "sessions");
    if (!fs.existsSync(sessionsDir)) return [];

    const results: CodexSessionStats[] = [];
    this.walkDir(sessionsDir, results);
    return results;
  }

  /**
   * 同步会话数据到数据库
   * 支持节流机制，避免频繁同步
   * @param force 是否强制同步（忽略节流）
   * @returns 同步结果
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
        source: "codex",
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
   * 读取会话转录内容
   * 从指定的会话文件中提取对话消息
   * @param sessionId 会话ID
   * @param limit 返回消息数量限制，默认40条
   * @returns 转录消息数组
   */
  readTranscript(sessionId: string, limit = 40): TranscriptMessage[] {
    const sessionsDir = path.join(resolveCodexHome(), "sessions");
    if (!fs.existsSync(sessionsDir)) return [];

    const found = this.findFile(sessionsDir, sessionId);
    if (!found) return [];
    return this.parseTranscript(found, limit);
  }

  /**
   * 递归遍历目录
   * 查找所有 jsonl 文件并解析会话统计
   * @param dir 目录路径
   * @param results 结果数组
   */
  private walkDir(dir: string, results: CodexSessionStats[]) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        this.walkDir(full, results);
      } else if (entry.endsWith(".jsonl")) {
        const stats = this.parseJsonl(full);
        if (stats) results.push(stats);
      }
    }
  }

  /**
   * 解析 JSONL 文件
   * 提取会话元数据、消息统计和 token 使用情况
   * @param filePath JSONL 文件路径
   * @returns 解析后的会话统计，如果解析失败返回 null
   */
  private parseJsonl(filePath: string): CodexSessionStats | null {
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
      let entry: CodexLine;
      try {
        entry = JSON.parse(line) as CodexLine;
      } catch {
        continue;
      }

      const ts = entry.timestamp ? new Date(entry.timestamp) : null;
      if (ts) {
        if (!firstMessageAt || ts < firstMessageAt) firstMessageAt = ts;
        if (!lastMessageAt || ts > lastMessageAt) lastMessageAt = ts;
      }

      if (entry.type === "session_meta") {
        sessionId = entry.payload.id;
        projectPath = entry.payload.cwd ?? null;
        model = entry.payload.model ?? null;
        gitBranch = entry.payload.git?.branch ?? null;
      }

      if (entry.type === "response_item") {
        const role = entry.payload.role;
        if (role === "user") {
          userMessages++;
          const text = extractText(entry.payload.content);
          if (text) lastUserPrompt = text.slice(0, 500);
        }
        if (role === "assistant") {
          assistantMessages++;
          if (entry.payload.usage) {
            inputTokens += entry.payload.usage.input_tokens ?? 0;
            outputTokens += entry.payload.usage.output_tokens ?? 0;
          }
        }
        if (entry.payload.type === "function_call" || entry.payload.type === "tool_call") {
          toolUses++;
        }
      }
    }

    if (!sessionId) sessionId = path.basename(filePath, ".jsonl");

    return {
      sessionId,
      projectSlug: deriveSlug(projectPath ?? filePath),
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
   * 递归查找会话文件
   * @param dir 搜索目录
   * @param sessionId 会话ID
   * @returns 文件路径，如果未找到返回 null
   */
  private findFile(dir: string, sessionId: string): string | null {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        const result = this.findFile(full, sessionId);
        if (result) return result;
      } else if (entry.includes(sessionId) && entry.endsWith(".jsonl")) {
        return full;
      }
    }
    return null;
  }

  /**
   * 解析转录文件
   * 提取对话消息（用户和助手）
   * @param filePath 文件路径
   * @param limit 返回消息数量限制
   * @returns 转录消息数组
   */
  private parseTranscript(filePath: string, limit: number): TranscriptMessage[] {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const messages: TranscriptMessage[] = [];

    for (const line of lines) {
      let entry: CodexLine;
      try {
        entry = JSON.parse(line) as CodexLine;
      } catch {
        continue;
      }

      if (entry.type !== "response_item") continue;
      if (!entry.payload.role) continue;

      messages.push({
        type: entry.payload.role,
        timestamp: entry.timestamp ?? null,
        content: entry.payload.content ?? null,
      });
    }

    return messages.slice(-limit);
  }
}

/**
 * 从消息内容中提取纯文本
 * 支持字符串和块结构（text/text 类型）
 * @param content 消息内容
 * @returns 提取的文本，如果无法提取返回 null
 */
function extractText(content: unknown): string | null {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === "object" && item !== null) {
        const block = item as Record<string, unknown>;
        if (block.type === "text" && typeof block.text === "string") return block.text;
        if (typeof block.text === "string") return block.text;
      }
    }
  }
  return null;
}

/**
 * 从路径生成项目 slug
 * 将路径中的斜杠替换为连字符
 * @param p 原始路径
 * @returns 生成的 slug
 */
function deriveSlug(p: string): string {
  return p.replace(/\//g, "-").replace(/^-/, "");
}
