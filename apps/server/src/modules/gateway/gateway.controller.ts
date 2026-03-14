import { GatewayService } from "./gateway.service";

import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

@Controller("gateway")
@UseGuards(JwtAuthGuard)
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Get("status")
  async getStatus(@Request() req: { user: { gatewayId: string } }) {
    return this.gatewayService.getStatus(req.user.gatewayId);
  }
}
