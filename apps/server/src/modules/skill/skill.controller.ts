import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { SkillService } from "./skill.service";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";

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
