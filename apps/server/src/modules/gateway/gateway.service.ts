import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGatewayDto } from "./dto/create-gateway.dto";
import { UpdateGatewayDto } from "./dto/update-gateway.dto";

@Injectable()
export class GatewayService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.gateway.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id } });
    if (!gateway) throw new NotFoundException("Gateway not found");
    return gateway;
  }

  async create(dto: CreateGatewayDto) {
    return this.prisma.gateway.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateGatewayDto) {
    await this.findById(id);
    return this.prisma.gateway.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.gateway.delete({ where: { id } });
  }
}
