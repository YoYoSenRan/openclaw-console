import { IsString, IsOptional, IsObject } from "class-validator";

export class CreateSessionDto {
  @IsString()
  agentId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
