import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { OpenclawService } from "./openclaw.service";
import { ClaudeSessionsService } from "./claude-sessions.service";
import { CodexSessionsService } from "./codex-sessions.service";
import { PrismaService } from "../../prisma/prisma.service";

interface ListSessionsQuery {
  source?: string;
  active?: string;
  limit?: string;
  offset?: string;
}

interface TranscriptQuery {
  source?: string;
  id: string;
  limit?: string;
}

@Controller("discovery")
export class DiscoveryController {
  constructor(
    private openclaw: OpenclawService,
    private claudeSessions: ClaudeSessionsService,
    private codexSessions: CodexSessionsService,
    private prisma: PrismaService,
  ) {}

  @Get("openclaw")
  discoverOpenclaw() {
    return this.openclaw.discoverLocal();
  }

  @Post("sessions")
  @UseGuards(JwtAuthGuard)
  async syncSessions(@Query("source") source = "all") {
    if (source === "claude") {
      return this.claudeSessions.sync(true);
    }
    if (source === "codex") {
      return this.codexSessions.sync(true);
    }
    const [claude, codex] = await Promise.all([
      this.claudeSessions.sync(true),
      this.codexSessions.sync(true),
    ]);
    return {
      upserted: claude.upserted + codex.upserted,
      skipped: claude.skipped + codex.skipped,
    };
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  async listSessions(@Query() query: ListSessionsQuery) {
    const limit = Math.min(Number(query.limit) || 50, 200);
    const offset = Number(query.offset) || 0;

    const where: Record<string, unknown> = {};
    if (query.source && query.source !== "all") where.source = query.source;
    if (query.active === "1" || query.active === "true") where.isActive = true;

    const [items, total] = await Promise.all([
      this.prisma.localSession.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.localSession.count({ where }),
    ]);

    const agg = await this.prisma.localSession.aggregate({
      where,
      _sum: {
        userMessages: true,
        assistantMessages: true,
        inputTokens: true,
        outputTokens: true,
        estimatedCost: true,
      },
    });

    return {
      items,
      total,
      stats: {
        totalUserMessages: agg._sum.userMessages ?? 0,
        totalAssistantMessages: agg._sum.assistantMessages ?? 0,
        totalInputTokens: agg._sum.inputTokens ?? 0,
        totalOutputTokens: agg._sum.outputTokens ?? 0,
        totalEstimatedCost: agg._sum.estimatedCost ?? 0,
      },
    };
  }

  @Get("sessions/transcript")
  @UseGuards(JwtAuthGuard)
  getTranscript(@Query() query: TranscriptQuery) {
    const limit = Math.min(Number(query.limit) || 40, 200);
    const source = query.source ?? "claude";

    if (source === "codex") {
      return this.codexSessions.readTranscript(query.id, limit);
    }
    return this.claudeSessions.readTranscript(query.id, limit);
  }
}
