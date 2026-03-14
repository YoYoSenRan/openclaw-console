import { Module } from "@nestjs/common";
import { DiscoveryController } from "./discovery.controller";
import { OpenclawService } from "./openclaw.service";
import { ClaudeSessionsService } from "./claude-sessions.service";
import { CodexSessionsService } from "./codex-sessions.service";

@Module({
  controllers: [DiscoveryController],
  providers: [OpenclawService, ClaudeSessionsService, CodexSessionsService],
})
export class DiscoveryModule {}
