export interface Gateway {
  id: string;
  name: string;
  endpoint: string;
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
  endpoint: string;
  config?: Record<string, unknown>;
}

export interface UpdateGatewayRequest {
  name?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
}
