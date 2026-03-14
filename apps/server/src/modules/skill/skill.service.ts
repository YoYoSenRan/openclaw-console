import type { PrismaService } from "../../prisma/prisma.service";
import type { CreateSkillDto } from "./dto/create.dto";
import type { UpdateSkillDto } from "./dto/update.dto";

import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skill.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException("Skill not found");
    return skill;
  }

  async create(dto: CreateSkillDto) {
    return this.prisma.skill.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateSkillDto) {
    await this.findById(id);
    return this.prisma.skill.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.skill.delete({ where: { id } });
  }
}
