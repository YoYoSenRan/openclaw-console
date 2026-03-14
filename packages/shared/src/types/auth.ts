export interface ConnectRequest {
  url: string;
  token?: string;
  password?: string;
  name?: string;
}

export interface ConnectResponse {
  accessToken: string;
  gatewayId: number;
}

export interface AuthStatusResponse {
  connected: boolean;
  gatewayId: number | null;
}

export interface RefreshResponse {
  accessToken: string;
}
