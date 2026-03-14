import type { PrismaService } from "../../prisma/prisma.service";
import type { CreateSessionDto } from "./dto/create.dto";

import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { startedAt: "desc" },
      include: { agent: true },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { agent: true },
    });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async create(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        agentId: dto.agentId,
        metadata: (dto.metadata ?? {}) as any,
      },
    });
  }
}
