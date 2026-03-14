import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { LocalSession } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseService } from "../../base/base.service";
import { resolveCodexHome } from "../../../utils/path";

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

interface CodexEventMsg {
  type: "event_msg";
  timestamp: string;
  payload: unknown;
}

type CodexLine = CodexSessionMeta | CodexResponseItem | CodexEventMsg;

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

export interface TranscriptMessage {
  type: string;
  timestamp: string | null;
  content: unknown;
}

export interface SyncResult {
  upserted: number;
  skipped: number;
}

const THROTTLE_MS = 30_000;

@Injectable()
export class CodexSessionsService extends BaseService<LocalSession> {
  private lastSyncAt = 0;
  private lastResult: SyncResult | null = null;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.localSession;
  }

  scan(): CodexSessionStats[] {
    const sessionsDir = path.join(resolveCodexHome(), "sessions");
    if (!fs.existsSync(sessionsDir)) return [];

    const results: CodexSessionStats[] = [];
    this.walkDir(sessionsDir, results);
    return results;
  }

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

  readTranscript(sessionId: string, limit = 40): TranscriptMessage[] {
    const sessionsDir = path.join(resolveCodexHome(), "sessions");
    if (!fs.existsSync(sessionsDir)) return [];

    const found = this.findFile(sessionsDir, sessionId);
    if (!found) return [];
    return this.parseTranscript(found, limit);
  }

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

function deriveSlug(p: string): string {
  return p.replace(/\//g, "-").replace(/^-/, "");
}
