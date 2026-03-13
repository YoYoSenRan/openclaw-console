import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agent.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException("Agent not found");
    return agent;
  }

  async create(dto: CreateAgentDto) {
    return this.prisma.agent.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateAgentDto) {
    await this.findById(id);
    return this.prisma.agent.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.agent.delete({ where: { id } });
  }
}
