export interface Gateway {
  id: number;
  name: string;
  url: string;
  status: GatewayStatus;
  lastHeartbeat: string | null;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export enum GatewayStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR",
}

export interface CreateGatewayRequest {
  name: string;
  url: string;
  config?: Record<string, unknown>;
}

export interface UpdateGatewayRequest {
  name?: string;
  url?: string;
  config?: Record<string, unknown>;
}
