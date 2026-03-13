import { IsString, IsOptional, IsObject, IsEnum } from "class-validator";

enum GatewayStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR",
}

export class UpdateGatewayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsEnum(GatewayStatus)
  status?: GatewayStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
