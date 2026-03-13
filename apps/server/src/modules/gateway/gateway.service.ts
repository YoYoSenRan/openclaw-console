import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BizException } from "../../common/exceptions/biz.exception";
import { BizCode } from "../../common/constants/codes";

@Injectable()
export class GatewayService implements OnModuleInit {
  private readonly logger = new Logger(GatewayService.name);
  private activeGatewayIds = new Set<string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 启动时检查已保存的 Gateway 配置，尝试自动连接
    const gateways = await this.prisma.gateway.findMany();
    for (const gw of gateways) {
      try {
        await this.testConnection(gw.endpoint, gw.authType, gw.credential);
        this.activeGatewayIds.add(gw.id);
        await this.prisma.gateway.update({
          where: { id: gw.id },
          data: { status: "CONNECTED", lastHeartbeat: new Date() },
        });
        this.logger.log(`Gateway "${gw.name}" 自动连接成功`);
      } catch {
        await this.prisma.gateway.update({
          where: { id: gw.id },
          data: { status: "DISCONNECTED" },
        });
        this.logger.warn(`Gateway "${gw.name}" 自动连接失败`);
      }
    }
  }

  async testConnection(_endpoint: string, _authType: string, _credential: string): Promise<void> {
    // TODO: 实际调用 Gateway 健康检查端点验证连接
    // 当前为占位实现，直接通过
    // 未来应发送 HTTP 请求到 endpoint 验证 authType + credential
  }

  async getStatus(gatewayId: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    if (!gateway) {
      throw new BizException(BizCode.GATEWAY_NOT_CONFIGURED, "Gateway 未配置");
    }

    return {
      id: gateway.id,
      name: gateway.name,
      endpoint: gateway.endpoint,
      status: gateway.status,
      lastHeartbeat: gateway.lastHeartbeat,
    };
  }

  onConnected(gatewayId: string) {
    this.activeGatewayIds.add(gatewayId);
  }

  onDisconnected(gatewayId: string) {
    this.activeGatewayIds.delete(gatewayId);
  }
}
