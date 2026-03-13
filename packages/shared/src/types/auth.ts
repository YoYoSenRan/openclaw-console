export interface ConnectRequest {
  url: string;
  token?: string;
  password?: string;
  name?: string;
}

export interface ConnectResponse {
  accessToken: string;
  gatewayId: string;
}

export interface AuthStatusResponse {
  connected: boolean;
  gatewayId: string | null;
}

export interface RefreshResponse {
  accessToken: string;
}
