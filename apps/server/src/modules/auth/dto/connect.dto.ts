import { IsString, IsIn } from "class-validator";

export class ConnectGatewayDto {
  @IsString()
  name: string;

  @IsString()
  endpoint: string;

  @IsIn(["token", "password"])
  authType: string;

  @IsString()
  credential: string;
}
