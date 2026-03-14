import type { HealthIndicatorResult } from "@nestjs/terminus";
import type { PrismaService } from "../../prisma/prisma.service";

import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthCheckError } from "@nestjs/terminus";

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch {
      throw new HealthCheckError("Database check failed", this.getStatus(key, false));
    }
  }
}
