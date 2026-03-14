import type { Agent, AgentStatus } from "@openclaw/shared";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Search, X, Bot, FolderOpen, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgentList, useAgentSync } from "@/hooks/use-agents";

const STATUS_COLORS: Record<AgentStatus, { dot: string; text: string }> = {
  idle: { dot: "bg-emerald-500", text: "text-emerald-600" },
  busy: { dot: "bg-amber-500", text: "text-amber-600" },
  offline: { dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  error: { dot: "bg-destructive", text: "text-destructive" },
};

const FILTER_KEYS = ["all", "idle", "busy", "offline", "error"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

function statusCounts(agents: Agent[]) {
  const counts: Record<string, number> = {
    all: agents.length,
    idle: 0,
    busy: 0,
    offline: 0,
    error: 0,
  };
  for (const a of agents) counts[a.status] = (counts[a.status] ?? 0) + 1;
  return counts;
}

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const { t } = useTranslation();
  const initials = agent.name.slice(0, 2).toUpperCase();
  const sc = STATUS_COLORS[agent.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        {/* avatar */}
        <div className="relative shrink-0">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
              sc.dot,
            )}
          />
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{agent.name}</span>
            {agent.isDefault && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                <Star className="size-2.5" />
                {t("agents.default")}
              </span>
            )}
          </div>
          {agent.role && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{agent.role}</p>
          )}
        </div>
      </div>

      {/* meta */}
      <div className="mt-3 space-y-1.5">
        {agent.workspacePath && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FolderOpen className="size-3 shrink-0" />
            <span className="truncate">{agent.workspacePath}</span>
          </div>
        )}
        {agent.lastActivity && (
          <p className="text-xs text-muted-foreground">
            {t("agents.lastActive")}: {new Date(agent.lastActivity).toLocaleString()}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <Tag className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{agent.source}</span>
        </div>
      </div>
    </button>
  );
}

function AgentDetailModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { t } = useTranslation();
  const sc = STATUS_COLORS[agent.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-default"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* panel */}
      <div className="relative bg-card border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t("agents.detailTitle")}</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-semibold">
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-medium">{agent.name}</p>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", sc.text)}>
                <span className={cn("size-2 rounded-full", sc.dot)} />
                {agent.status}
              </span>
            </div>
          </div>

          {/* fields */}
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {agent.role && (
              <>
                <span className="text-muted-foreground">Role</span>
                <span>{agent.role}</span>
              </>
            )}
            {agent.description && (
              <>
                <span className="text-muted-foreground">Description</span>
                <span>{agent.description}</span>
              </>
            )}
            {agent.workspacePath && (
              <>
                <span className="text-muted-foreground">{t("agents.workspace")}</span>
                <span className="font-mono text-xs break-all">{agent.workspacePath}</span>
              </>
            )}
            <span className="text-muted-foreground">{t("agents.source")}</span>
            <span>{agent.source}</span>
            <span className="text-muted-foreground">{t("agents.default")}</span>
            <span>{agent.isDefault ? "Yes" : "No"}</span>
            {agent.lastActivity && (
              <>
                <span className="text-muted-foreground">{t("agents.lastActive")}</span>
                <span>{new Date(agent.lastActivity).toLocaleString()}</span>
              </>
            )}
          </div>

          {/* config JSON */}
          {agent.config && Object.keys(agent.config).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{t("agents.config")}</p>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto max-h-60">
                {JSON.stringify(agent.config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { t } = useTranslation();
  const { data: agents = [], isLoading, refetch } = useAgentList();
  const syncMutation = useAgentSync();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Agent | null>(null);

  // filter + search
  const filtered = agents.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = statusCounts(agents);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("agents.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("agents.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={cn("size-4", syncMutation.isPending && "animate-spin")} />
            {t("agents.sync")}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => refetch()}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("agents.search")}
            className="w-full h-8 pl-8 pr-3 text-sm rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        {/* status chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t(`agents.filter${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              <span className="opacity-70">{counts[key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        /* empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-base font-medium text-muted-foreground">{t("agents.empty")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">{t("agents.emptyHint")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={cn("size-4", syncMutation.isPending && "animate-spin")} />
            {t("agents.sync")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{t("agents.noMatch")}</p>
        </div>
      ) : (
        /* card grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelected(agent)} />
          ))}
        </div>
      )}

      {/* detail modal */}
      {selected && <AgentDetailModal agent={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
