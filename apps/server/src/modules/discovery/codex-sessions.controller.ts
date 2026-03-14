import { Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { BaseController } from "../base/base.controller";

@Controller("discovery/codex")
@UseGuards(JwtAuthGuard)
export class CodexSessionsController extends BaseController {
  // POST /discovery/codex/scan — 扫描本地 JSONL，返回原始结果，不写 DB
  @Post("scan")
  scan() {}

  // POST /discovery/codex/sync — 扫描并 upsert 到 DB
  @Post("sync")
  sync() {}

  // GET /discovery/codex/list — 全量列表（不分页）
  @Get("list")
  list() {}

  // GET /discovery/codex/page — 分页列表 + 聚合统计
  @Get("page")
  page() {}

  // GET /discovery/codex/detail?id=xxx — 单条会话详情
  @Get("detail")
  detail(@Query("id") id: string) {}

  // GET /discovery/codex/transcript?id=xxx&limit=40 — 按需读 JSONL 原文
  @Get("transcript")
  transcript(@Query("id") id: string, @Query("limit") limit?: string) {}

  // DELETE /discovery/codex/remove?id=xxx — 从 DB 删除单条记录
  @Delete("remove")
  remove(@Query("id") id: string) {}
}
