import { AgentsService } from "./agents.service";

import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/auth.guard";
import { BaseController } from "../../base/base.controller";

@Controller("discovery/openclaw/agents")
@UseGuards(JwtAuthGuard)
export class AgentsController extends BaseController {
  constructor(private readonly service: AgentsService) {
    super();
  }

  @Post("sync")
  sync() {
    return this.service.sync();
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
}
