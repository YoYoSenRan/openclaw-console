import type { HealthCheckService } from "@nestjs/terminus";
import type { PrismaHealthIndicator } from "./database.health";

import { Controller, Get } from "@nestjs/common";
import { HealthCheck } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy("database")]);
  }
}
