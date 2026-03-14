import { Controller, Delete, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/auth.guard";
import { BaseController } from "../../base/base.controller";
import { CodexSessionsService } from "./codex-sessions.service";

@Controller("discovery/codex")
@UseGuards(JwtAuthGuard)
export class CodexSessionsController extends BaseController {
  constructor(private readonly service: CodexSessionsService) {
    super();
  }

  @Post("scan")
  scan() {
    return this.service.scan();
  }

  @Post("sync")
  sync() {
    return this.service.sync(true);
  }

  @Get("list")
  list(@Query() query: Record<string, unknown>) {
    const where = this.parseWhere(query);
    return this.service.list(where);
  }

  @Get("page")
  page(@Query() query: Record<string, unknown>) {
    const { page, size } = this.parsePage(query);
    const where = this.parseWhere(query);
    return this.service.page(where, page, size);
  }

  @Get("detail")
  detail(@Query("id") id: string) {
    return this.service.detail(id);
  }

  @Get("transcript")
  transcript(@Query("id") id: string, @Query("limit") limit?: string) {
    return this.service.readTranscript(id, limit ? Number(limit) : undefined);
  }

  @Delete("remove")
  remove(@Query("id") id: string) {
    return this.service.remove(id);
  }
}
