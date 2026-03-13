export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export enum AgentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  config?: Record<string, unknown>;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: AgentStatus;
  config?: Record<string, unknown>;
}
