import { Module } from "@nestjs/common";
import { OpenclawService } from "./openclaw/openclaw.service";
import { ClaudeSessionsService } from "./claude/claude-sessions.service";
import { CodexSessionsService } from "./codex/codex-sessions.service";

@Module({
  exports: [OpenclawService, ClaudeSessionsService, CodexSessionsService],
  providers: [OpenclawService, ClaudeSessionsService, CodexSessionsService],
})
export class LocalModule {}
