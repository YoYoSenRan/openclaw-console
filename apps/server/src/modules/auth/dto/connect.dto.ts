import { IsString, IsOptional, ValidateIf } from "class-validator";

export class ConnectGatewayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  token?: string;

  @ValidateIf((o) => !o.token)
  @IsString()
  password?: string;
}
