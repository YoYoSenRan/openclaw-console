import { Module } from "@nestjs/common";
import { OpenclawController } from "./openclaw/openclaw.controller";
import { AgentsController } from "./openclaw/agents.controller";
import { ClaudeSessionsController } from "./claude/claude-sessions.controller";
import { CodexSessionsController } from "./codex/codex-sessions.controller";
import { OpenclawService } from "./openclaw/openclaw.service";
import { AgentsService } from "./openclaw/agents.service";
import { ClaudeSessionsService } from "./claude/claude-sessions.service";
import { CodexSessionsService } from "./codex/codex-sessions.service";

/**
 * 发现模块
 * 整合 OpenClaw、Claude 和 Codex 会话发现功能
 * 提供控制器和服务提供者配置
 */
@Module({
  controllers: [
    OpenclawController,
    AgentsController,
    ClaudeSessionsController,
    CodexSessionsController,
  ],
  providers: [OpenclawService, AgentsService, ClaudeSessionsService, CodexSessionsService],
})
export class DiscoveryModule {}
