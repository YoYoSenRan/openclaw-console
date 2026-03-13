import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GatewayService } from "./gateway.service";
import { CreateGatewayDto } from "./dto/create-gateway.dto";
import { UpdateGatewayDto } from "./dto/update-gateway.dto";

@Controller("gateways")
@UseGuards(JwtAuthGuard)
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Get()
  findAll() {
    return this.gatewayService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gatewayService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateGatewayDto) {
    return this.gatewayService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateGatewayDto) {
    return this.gatewayService.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.gatewayService.delete(id);
  }
}
