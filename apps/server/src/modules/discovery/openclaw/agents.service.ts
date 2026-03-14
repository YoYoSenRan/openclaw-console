import type { Agent, Prisma } from "@prisma/client";

import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { BaseService } from "../../base/base.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { OpenclawService } from "./openclaw.service";

interface OpenclawAgent {
  id: string;
  name: string;
  workspace?: string;
  default?: boolean;
  groupChat?: { mentionPatterns?: string[] };
  [key: string]: unknown;
}

export interface AgentSyncResult {
  upserted: number;
  skipped: number;
}

@Injectable()
export class AgentsService extends BaseService<Agent> {
  constructor(
    prisma: PrismaService,
    private readonly openclawService: OpenclawService,
  ) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.agent;
  }

  async sync(): Promise<AgentSyncResult> {
    const config = this.openclawService.readConfig();
    if (!config) return { upserted: 0, skipped: 0 };

    const agentsList = (config.agents as { list?: OpenclawAgent[] })?.list;
    if (!Array.isArray(agentsList) || agentsList.length === 0) {
      return { upserted: 0, skipped: 0 };
    }

    let upserted = 0;
    let skipped = 0;

    for (const agent of agentsList) {
      const contentHash = createHash("md5").update(JSON.stringify(agent)).digest("hex");

      const existing = await this.prisma.agent.findUnique({ where: { name: agent.id } });
      if (existing?.contentHash === contentHash) {
        skipped++;
        continue;
      }

      const payload = {
        role: "agent",
        workspacePath: agent.workspace ?? null,
        isDefault: agent.default ?? false,
        mentionPatterns: agent.groupChat?.mentionPatterns ?? [],
        config: agent as Prisma.InputJsonValue,
        source: "local",
        contentHash,
      };

      await this.prisma.agent.upsert({
        where: { name: agent.id },
        create: { name: agent.id, ...payload },
        update: payload,
      });
      upserted++;
    }

    return { upserted, skipped };
  }
}
