import type { Agent, Prisma } from "@prisma/client";
import type { AgentSyncResult } from "@openclaw/shared";

import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { BaseService } from "../base/base.service";
import { PrismaService } from "../../prisma/prisma.service";
import { OpenclawService } from "../local/openclaw/openclaw.service";

/**
 * Openclaw 本地 Agent 配置
 * 从 Openclaw 配置文件读取的 Agent 数据结构
 */
export interface OpenclawAgent {
  id: string;
  name: string;
  workspace?: string;
  default?: boolean;
  groupChat?: { mentionPatterns?: string[] };
  [key: string]: unknown;
}

/**
 * Agent 管理服务
 * 负责从本地 Openclaw 配置同步 Agent 数据到数据库
 */
@Injectable()
export class AgentService extends BaseService<Agent> {
  constructor(
    prisma: PrismaService,
    private readonly openclawService: OpenclawService,
  ) {
    super(prisma);
  }

  /**
   * 获取数据库代理对象
   */
  protected get delegate() {
    return this.prisma.agent;
  }

  /**
   * 更新 Agent 记录
   * @param id Agent 记录 ID
   * @param data 更新数据
   * @returns 更新后的 Agent 记录
   */
  async update(id: number, data: Record<string, unknown>): Promise<Agent> {
    return this.prisma.agent.update({ where: { id }, data: data as any });
  }

  /** 同步本地 Agent 配置到数据库，使用内容哈希跳过未变化的记录 */
  async sync(): Promise<AgentSyncResult> {
    if (!this.openclawService.available()) return { upserted: 0, skipped: 0 };

    const agents = this.openclawService.agents() as { list?: OpenclawAgent[] } | null;
    if (!agents?.list?.length) return { upserted: 0, skipped: 0 };

    let upserted = 0;
    let skipped = 0;

    for (const agent of agents.list) {
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
