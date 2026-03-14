import { Module } from "@nestjs/common";
import { OpenclawController } from "./openclaw/openclaw.controller";
import { ClaudeSessionsController } from "./claude/claude-sessions.controller";
import { CodexSessionsController } from "./codex/codex-sessions.controller";
import { OpenclawService } from "./openclaw/openclaw.service";
import { ClaudeSessionsService } from "./claude/claude-sessions.service";
import { CodexSessionsService } from "./codex/codex-sessions.service";

@Module({
  controllers: [OpenclawController, ClaudeSessionsController, CodexSessionsController],
  providers: [OpenclawService, ClaudeSessionsService, CodexSessionsService],
})
export class DiscoveryModule {}
