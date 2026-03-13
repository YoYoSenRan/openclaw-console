import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionService } from "./session.service";
import { CreateSessionDto } from "./dto/create-session.dto";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.sessionService.findById(id);
  }

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateSessionDto) {
    return this.sessionService.create(userId, dto);
  }
}
