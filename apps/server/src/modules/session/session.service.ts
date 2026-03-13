import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSessionDto } from "./dto/create-session.dto";

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { startedAt: "desc" },
      include: { agent: true, user: true },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { agent: true, user: true },
    });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async create(userId: string, dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        agentId: dto.agentId,
        userId,
        metadata: (dto.metadata ?? {}) as any,
      },
    });
  }
}
