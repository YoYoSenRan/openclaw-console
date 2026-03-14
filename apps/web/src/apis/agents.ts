import type { Agent, AgentSyncResult } from "@openclaw/shared";

import http from "@/https";

const BASE = "/agents";

export const agentsApi = {
  list: (params?: Record<string, unknown>): Promise<Agent[]> =>
    http.post<Agent[]>(`${BASE}/list`, params).then((r) => r.data),

  detail: (id: number): Promise<Agent> =>
    http.post<Agent>(`${BASE}/detail`, { id }).then((r) => r.data),

  add: (data: Partial<Agent>): Promise<Agent> =>
    http.post<Agent>(`${BASE}/add`, data).then((r) => r.data),

  update: (data: Partial<Agent> & { id: number }): Promise<Agent> =>
    http.post<Agent>(`${BASE}/update`, data).then((r) => r.data),

  remove: (id: number): Promise<Agent> =>
    http.post<Agent>(`${BASE}/remove`, { id }).then((r) => r.data),

  sync: (): Promise<AgentSyncResult> =>
    http.post<AgentSyncResult>(`${BASE}/sync`).then((r) => r.data),
};
