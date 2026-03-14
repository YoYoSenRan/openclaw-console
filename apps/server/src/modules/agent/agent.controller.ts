import type { CreateAgentDto } from "./dto/create.dto";
import type { UpdateAgentDto } from "./dto/update.dto";

import { AgentService } from "./agent.service";

import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { BaseController } from "../base/base.controller";

@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentController extends BaseController {
  constructor(private readonly service: AgentService) {
    super();
  }

  @Post("list")
  list(@Body() body: Record<string, unknown>) {
    const where = this.parseWhere(body);
    return this.service.list(where);
  }

  @Post("detail")
  detail(@Body("id") id: string) {
    return this.service.detail(id);
  }

  @Post("add")
  add(@Body() dto: CreateAgentDto) {
    return this.service.add(dto);
  }

  @Post("update")
  update(@Body() dto: UpdateAgentDto) {
    const { id, ...data } = dto;
    return this.service.update(id, data);
  }

  @Post("remove")
  remove(@Body("id") id: string) {
    return this.service.remove(id);
  }

  @Post("scan")
  scan() {
    return this.service.scan();
  }

  @Post("sync")
  sync() {
    return this.service.sync();
  }
}
