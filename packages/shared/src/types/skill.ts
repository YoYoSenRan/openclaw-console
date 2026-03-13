export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillRequest {
  name: string;
  description?: string;
  version: string;
  config?: Record<string, unknown>;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  version?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}
