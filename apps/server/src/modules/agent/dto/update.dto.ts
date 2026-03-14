import { IsString, IsOptional, IsObject, IsEnum, IsBoolean, IsInt } from "class-validator";

enum AgentStatus {
  offline = "offline",
  idle = "idle",
  busy = "busy",
  error = "error",
}

export class UpdateAgentDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  workspacePath?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
