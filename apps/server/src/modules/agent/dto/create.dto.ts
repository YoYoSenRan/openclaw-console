import { IsString, IsOptional, IsObject, IsBoolean } from "class-validator";

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
