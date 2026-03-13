export interface Session {
  id: string;
  agentId: string;
  userId: string;
  status: SessionStatus;
  metadata: Record<string, unknown>;
  startedAt: string;
  endedAt: string | null;
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface CreateSessionRequest {
  agentId: string;
  metadata?: Record<string, unknown>;
}
