export type AgentStatus = "offline" | "idle" | "busy" | "error";

export interface Agent {
  id: number;
  name: string;
  role: string | null;
  sessionKey: string | null;
  soulContent: string | null;
  status: AgentStatus;
  lastSeen: number | null;
  lastActivity: string | null;
  description: string | null;
  isDefault: boolean;
  mentionPatterns: string[];
  config: Record<string, unknown>;
  workspaceId: number;
  workspacePath: string | null;
  source: string;
  contentHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSyncResult {
  upserted: number;
  skipped: number;
}
