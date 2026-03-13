import { Controller, Get, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ConnectGatewayDto } from "./dto/connect.dto";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("status")
  async status() {
    return this.authService.getStatus();
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
