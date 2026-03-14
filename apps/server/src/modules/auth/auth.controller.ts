import type { AuthService } from "./auth.service";
import type { ConnectGatewayDto } from "./dto/connect.dto";

import { Controller, Get, Post, Body, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("status")
  @UseGuards(JwtAuthGuard)
  async status(@Request() req: { user: { gatewayId: string } }) {
    return this.authService.getStatus(req.user.gatewayId);
  }

  @Post("connect")
  async connect(@Body() dto: ConnectGatewayDto) {
    return this.authService.connect(dto);
  }

  @Post("disconnect")
  @UseGuards(JwtAuthGuard)
  async disconnect(@Request() req: { user: { gatewayId: string } }) {
    return this.authService.disconnect(req.user.gatewayId);
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: { user: { gatewayId: string } }) {
    return this.authService.refresh(req.user.gatewayId);
  }
}
