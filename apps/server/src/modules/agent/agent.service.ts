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

  /**
   * 扫描本地 openclaw.json 中的 agents 配置并原样返回
   * 不写入数据库，仅用于预览
   */
  scan(): OpenclawAgent[] {
    const config = this.openclawService.readConfig();
    if (!config) return [];

    const agentsList = (config.agents as { list?: OpenclawAgent[] })?.list;
    if (!Array.isArray(agentsList) || agentsList.length === 0) return [];

    return agentsList;
  }

  /**
   * 同步本地 Agent 配置到数据库
   * 读取 Openclaw 配置文件，将 Agent 数据同步到数据库
   * 使用内容哈希判断是否需要更新（内容未变化则跳过）
   * @returns 同步结果，包含插入/更新的数量和跳过的数量
   */
  async sync(): Promise<AgentSyncResult> {
    const config = this.openclawService.readConfig(); // 读取本地 Openclaw 配置文件
    if (!config) return { upserted: 0, skipped: 0 }; // 配置文件不存在则返回空结果

    // 从配置中提取 agents.list 数组，as 断言类型以便访问 list 属性
    const agentsList = (config.agents as { list?: OpenclawAgent[] })?.list;
    // 如果列表不存在或为空，返回空结果
    if (!Array.isArray(agentsList) || agentsList.length === 0) {
      return { upserted: 0, skipped: 0 };
    }

    let upserted = 0; // 计数器：插入或更新的记录数
    let skipped = 0; // 计数器：跳过的记录数

    // 遍历每个 agent 配置
    for (const agent of agentsList) {
      // 将 agent 对象序列化为 JSON 字符串，计算 MD5 哈希值，用于判断内容是否变化
      const contentHash = createHash("md5").update(JSON.stringify(agent)).digest("hex");

      // 查询数据库中是否已存在同名（name = agent.id）的 agent 记录
      const existing = await this.prisma.agent.findUnique({ where: { name: agent.id } });
      // 如果已存在且哈希值相同，说明配置未变化，跳过本次同步
      if (existing?.contentHash === contentHash) {
        skipped++;
        continue;
      }

      // 构建待写入/更新的数据 payload
      const payload = {
        role: "agent", // 角色类型为 agent
        workspacePath: agent.workspace ?? null, // 工作空间路径，不存在则为 null
        isDefault: agent.default ?? false, // 是否为默认 agent
        mentionPatterns: agent.groupChat?.mentionPatterns ?? [], // 群聊@提及模式
        config: agent as Prisma.InputJsonValue, // 完整配置存为 JSON
        source: "local", // 数据来源标记为本地
        contentHash, // 内容哈希值
      };

      // 使用 upsert：不存在则创建，存在则更新
      await this.prisma.agent.upsert({
        where: { name: agent.id }, // 以 agent.id 作为唯一标识
        create: { name: agent.id, ...payload }, // 不存在时创建
        update: payload, // 存在时更新
      });
      upserted++; // 计数 +1
    }

    return { upserted, skipped }; // 返回同步统计结果
  }
}
