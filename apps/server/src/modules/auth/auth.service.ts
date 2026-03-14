import type { JwtService } from "@nestjs/jwt";
import type { PrismaService } from "../../prisma/prisma.service";
import type { GatewayService } from "../gateway/gateway.service";
import type { ConnectGatewayDto } from "./dto/connect.dto";

import { Injectable } from "@nestjs/common";
import { BizException } from "../../common/exceptions/biz.exception";
import { BizCode } from "../../common/constants/codes";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private gatewayService: GatewayService,
  ) {}

  async getStatus(gatewayId: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    return { connected: !!gateway, gatewayId: gateway?.id ?? null };
  }

  async connect(dto: ConnectGatewayDto) {
    // 验证 Gateway 连接
    await this.gatewayService.testConnection(dto.url, dto.token, dto.password);

    // 清除现有 Gateway 配置（单实例模式）
    await this.prisma.gateway.deleteMany();

    // 保存新的 Gateway 配置
    const gateway = await this.prisma.gateway.create({
      data: {
        name: dto.name || new URL(dto.url).host,
        url: dto.url,
        token: dto.token,
        password: dto.password,
        status: "CONNECTED",
        lastHeartbeat: new Date(),
      },
    });

    // 通知 GatewayService 建立连接
    this.gatewayService.onConnected(gateway.id);

    const accessToken = this.signToken(gateway.id);

    return { accessToken, gatewayId: gateway.id };
  }

  async disconnect(gatewayId: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    if (!gateway) {
      throw new BizException(BizCode.GATEWAY_NOT_CONFIGURED, "Gateway 未配置");
    }

    this.gatewayService.onDisconnected(gatewayId);
    await this.prisma.gateway.delete({ where: { id: gatewayId } });

    return { disconnected: true };
  }

  async refresh(gatewayId: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    if (!gateway) {
      throw new BizException(BizCode.GATEWAY_NOT_CONFIGURED, "Gateway 未配置");
    }

    const accessToken = this.signToken(gateway.id);
    return { accessToken };
  }

  private signToken(gatewayId: string): string {
    return this.jwtService.sign({ gatewayId });
  }
}
