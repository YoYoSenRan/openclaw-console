import { AgentService } from "./agent.service";
import type { CreateAgentDto } from "./dto/create.dto";
import type { UpdateAgentDto } from "./dto/update.dto";
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  findAll() {
    return this.agentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.agentService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAgentDto) {
    return this.agentService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAgentDto) {
    return this.agentService.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.agentService.delete(id);
  }
}
