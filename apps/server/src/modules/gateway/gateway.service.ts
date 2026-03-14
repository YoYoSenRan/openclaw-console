import type { OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { PrismaService } from "../../prisma/prisma.service";

import { Injectable, Logger } from "@nestjs/common";
import { BizException } from "../../common/exceptions/biz.exception";
import { BizCode } from "../../common/constants/codes";

@Injectable()
export class GatewayService implements OnModuleInit {
  private readonly logger = new Logger(GatewayService.name);
  private activeGatewayIds = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    // 环境变量自动种子：如果 DB 无 gateway 且配置了 GATEWAY_URL，自动创建
    const count = await this.prisma.gateway.count();
    if (count === 0) {
      const url = this.config.get<string>("GATEWAY_URL");
      if (url) {
        const name = this.config.get<string>("GATEWAY_NAME", "Default Gateway");
        const token = this.config.get<string>("GATEWAY_TOKEN");
        const password = this.config.get<string>("GATEWAY_PASSWORD");

        try {
          await this.testConnection(url, token, password);
          const gw = await this.prisma.gateway.create({
            data: {
              name,
              url,
              token,
              password,
              status: "CONNECTED",
              lastHeartbeat: new Date(),
            },
          });
          this.activeGatewayIds.add(gw.id);
          this.logger.log(`从环境变量自动创建并连接 Gateway "${name}"`);
        } catch (err) {
          this.logger.warn(`从环境变量自动创建 Gateway 失败: ${err}`);
        }
      }
      return;
    }

    // 启动时检查已保存的 Gateway 配置，尝试自动连接
    const gateways = await this.prisma.gateway.findMany();
    for (const gw of gateways) {
      try {
        await this.testConnection(gw.url, gw.token, gw.password);
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

  async testConnection(
    url: string,
    _token?: string | null,
    _password?: string | null,
  ): Promise<void> {
    // ws:// → http://, wss:// → https://，用 HTTP 做健康检查
    const httpBase = url.replace(/\/+$/, "").replace(/^ws(s?):\/\//, "http$1://");
    const healthUrl = `${httpBase}/health`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(healthUrl, { signal: controller.signal });
      if (!res.ok) {
        throw new BizException(
          BizCode.GATEWAY_CONNECT_FAILED,
          `Gateway 健康检查失败: HTTP ${res.status}`,
        );
      }
    } catch (err) {
      if (err instanceof BizException) throw err;
      throw new BizException(BizCode.GATEWAY_CONNECT_FAILED, `无法连接到 Gateway: ${err}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getStatus(gatewayId: string) {
    const gateway = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    if (!gateway) {
      throw new BizException(BizCode.GATEWAY_NOT_CONFIGURED, "Gateway 未配置");
    }

    return {
      id: gateway.id,
      name: gateway.name,
      url: gateway.url,
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
