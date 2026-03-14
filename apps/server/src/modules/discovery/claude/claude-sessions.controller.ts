import { ClaudeSessionsService } from "./claude-sessions.service";

import { Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/auth.guard";
import { BaseController } from "../../base/base.controller";

/**
 * Claude 会话发现控制器
 * 提供 Claude Code 本地会话的扫描、同步、查询功能
 */
@Controller("discovery/claude")
@UseGuards(JwtAuthGuard)
export class ClaudeSessionsController extends BaseController {
  constructor(private readonly service: ClaudeSessionsService) {
    super();
  }

  /**
   * 扫描本地 Claude 会话
   * 读取 ~/.claude/projects 目录下的会话文件
   */
  @Post("scan")
  scan() {
    return this.service.scan();
  }

  /**
   * 同步 Claude 会话到数据库
   * 将扫描到的会话信息持久化到本地数据库
   */
  @Post("sync")
  sync() {
    return this.service.sync(true);
  }

  /**
   * 获取会话列表
   */
  @Get("list")
  list(@Query() query: Record<string, unknown>) {
    const where = this.parseWhere(query);
    return this.service.list(where);
  }

  /**
   * 分页获取会话列表
   */
  @Get("page")
  page(@Query() query: Record<string, unknown>) {
    const { page, size } = this.parsePage(query);
    const where = this.parseWhere(query);
    return this.service.page(where, page, size);
  }

  /**
   * 获取会话详情
   */
  @Get("detail")
  detail(@Query("id") id: string) {
    return this.service.detail(id);
  }

  /**
   * 获取会话对话记录
   */
  @Get("transcript")
  transcript(@Query("id") id: string, @Query("limit") limit?: string) {
    return this.service.readTranscript(id, limit ? Number(limit) : undefined);
  }

  /**
   * 删除会话记录
   */
  @Delete("remove")
  remove(@Query("id") id: string) {
    return this.service.remove(id);
  }
}
