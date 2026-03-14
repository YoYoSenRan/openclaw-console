import type { SkillService } from "./skill.service";
import type { CreateSkillDto } from "./dto/create.dto";
import type { UpdateSkillDto } from "./dto/update.dto";

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

@Controller("skills")
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.skillService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSkillDto) {
    return this.skillService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSkillDto) {
    return this.skillService.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.skillService.delete(id);
  }
}
