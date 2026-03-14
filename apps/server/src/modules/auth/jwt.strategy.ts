import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { BizException } from "../../common/exceptions/biz.exception";
import { BizCode } from "../../common/constants/codes";

interface JwtPayload {
  gatewayId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET", "default-secret"),
    });
  }

  async validate(payload: JwtPayload) {
    const gateway = await this.prisma.gateway.findUnique({
      where: { id: payload.gatewayId },
    });

    if (!gateway) {
      throw new BizException(BizCode.GATEWAY_NOT_CONFIGURED, "Gateway 未配置或已断开");
    }

    return { gatewayId: payload.gatewayId };
  }
}
