import { IsString, IsOptional, IsObject } from "class-validator";

export class CreateGatewayDto {
  @IsString()
  name: string;

  @IsString()
  endpoint: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
