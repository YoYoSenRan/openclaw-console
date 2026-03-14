import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  Bot,
  Wifi,
  MessageSquare,
  Puzzle,
  RefreshCw,
  ArrowRight,
  Circle,
  Network,
} from "lucide-react";

// -- mock data (后续替换为 API 调用) --

const MOCK_STATS = {
  totalAgents: 5,
  onlineAgents: 3,
  totalSessions: 42,
  totalSkills: 8,
};

const MOCK_GATEWAY = {
  status: "connected" as const,
  url: "ws://127.0.0.1:18789",
  lastHeartbeat: "2026-03-14T10:32:00Z",
};

const MOCK_AGENT_STATUS = {
  idle: 2,
  busy: 1,
  offline: 1,
  error: 1,
};

const MOCK_RECENT_SESSIONS = [
  {
    id: "s1",
    source: "Claude",
    project: "openclaw-console",
    time: "2026-03-14T10:30:00Z",
    status: "COMPLETED",
  },
  {
    id: "s2",
    source: "Claude",
    project: "my-saas-app",
    time: "2026-03-14T09:15:00Z",
    status: "ACTIVE",
  },
  {
    id: "s3",
    source: "Codex",
    project: "data-pipeline",
    time: "2026-03-13T22:45:00Z",
    status: "COMPLETED",
  },
  {
    id: "s4",
    source: "Claude",
    project: "blog-site",
    time: "2026-03-13T18:20:00Z",
    status: "FAILED",
  },
  {
    id: "s5",
    source: "Codex",
    project: "ml-experiments",
    time: "2026-03-13T14:00:00Z",
    status: "COMPLETED",
  },
];

// -- components --

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-4">
      <div className={`rounded-md p-2 ${accent ?? "bg-primary/10 text-primary"}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function GatewayStatusCard() {
  const { t } = useTranslation();
  const gw = MOCK_GATEWAY;

  const statusConfig = {
    connected: {
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      label: t("dashboard.gateway.connected"),
    },
    disconnected: {
      color: "text-muted-foreground",
      bg: "bg-muted-foreground",
      label: t("dashboard.gateway.disconnected"),
    },
    error: { color: "text-destructive", bg: "bg-destructive", label: t("dashboard.gateway.error") },
  };

  const st = statusConfig[gw.status];

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Network className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">{t("dashboard.gateway.title")}</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("dashboard.gateway.status")}</span>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${st.color}`}>
            <span className={`size-2 rounded-full ${st.bg}`} />
            {st.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("dashboard.gateway.url")}</span>
          <span className="text-sm font-mono">{gw.url}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("dashboard.gateway.lastHeartbeat")}
          </span>
          <span className="text-sm">{new Date(gw.lastHeartbeat).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

function AgentStatusCard() {
  const { t } = useTranslation();
  const data = MOCK_AGENT_STATUS;
  const total = data.idle + data.busy + data.offline + data.error;

  const segments = [
    {
      key: "idle",
      count: data.idle,
      color: "bg-emerald-500",
      label: t("dashboard.agentStatus.idle"),
    },
    {
      key: "busy",
      count: data.busy,
      color: "bg-amber-500",
      label: t("dashboard.agentStatus.busy"),
    },
    {
      key: "offline",
      count: data.offline,
      color: "bg-muted-foreground/40",
      label: t("dashboard.agentStatus.offline"),
    },
    {
      key: "error",
      count: data.error,
      color: "bg-destructive",
      label: t("dashboard.agentStatus.error"),
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">{t("dashboard.agentStatus.title")}</h3>
      </div>
      {/* bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-4">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`${s.color} transition-all`}
            style={{ width: `${(s.count / total) * 100}%` }}
          />
        ))}
      </div>
      {/* legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${s.color}`} />
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <span className="text-sm font-medium ml-auto">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSessionsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusStyle: Record<string, string> = {
    ACTIVE: "text-emerald-600 bg-emerald-500/10",
    COMPLETED: "text-muted-foreground bg-muted",
    FAILED: "text-destructive bg-destructive/10",
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t("dashboard.recentSessions.title")}</h3>
        </div>
        <button
          type="button"
          onClick={() => navigate("/sessions")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("dashboard.recentSessions.viewAll")}
          <ArrowRight className="size-3" />
        </button>
      </div>
      <div className="divide-y">
        {MOCK_RECENT_SESSIONS.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.project}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.source}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(s.time).toLocaleDateString()}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[s.status] ?? ""}`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const { t } = useTranslation();

  const actions = [
    {
      key: "sync-agents",
      icon: RefreshCw,
      label: t("dashboard.quickActions.syncAgents"),
      desc: t("dashboard.quickActions.syncAgentsDesc"),
    },
    {
      key: "scan-claude",
      icon: MessageSquare,
      label: t("dashboard.quickActions.scanClaude"),
      desc: t("dashboard.quickActions.scanClaudeDesc"),
    },
    {
      key: "scan-codex",
      icon: Circle,
      label: t("dashboard.quickActions.scanCodex"),
      desc: t("dashboard.quickActions.scanCodexDesc"),
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="text-sm font-medium mb-4">{t("dashboard.quickActions.title")}</h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-accent transition-colors"
          >
            <a.icon className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// -- page --

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.welcome")}</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Bot}
          label={t("dashboard.stats.totalAgents")}
          value={MOCK_STATS.totalAgents}
        />
        <StatCard
          icon={Wifi}
          label={t("dashboard.stats.onlineAgents")}
          value={MOCK_STATS.onlineAgents}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={MessageSquare}
          label={t("dashboard.stats.totalSessions")}
          value={MOCK_STATS.totalSessions}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={Puzzle}
          label={t("dashboard.stats.totalSkills")}
          value={MOCK_STATS.totalSkills}
          accent="bg-violet-500/10 text-violet-600"
        />
      </div>

      {/* middle row: gateway + agent status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GatewayStatusCard />
        <AgentStatusCard />
      </div>

      {/* bottom row: recent sessions + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentSessionsCard />
        </div>
        <QuickActionsCard />
      </div>
    </div>
  );
}
