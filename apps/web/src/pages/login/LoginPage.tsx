import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth";
import api from "@/lib/api";
import type { ConnectResponse, DiscoverOpenClawResult } from "@openclaw/shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useTranslation();

  const [url, setUrl] = useState("ws://127.0.0.1:18789");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<DiscoverOpenClawResult | null>(null);

  const canSubmit = url && (token || password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<ConnectResponse>("/auth/connect", {
        url,
        token: token || undefined,
        password: password || undefined,
      });
      setAuth(data.accessToken, data.gatewayId);
      navigate("/dashboard");
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setDiscoverResult(null);
    try {
      const { data } = await api.get<DiscoverOpenClawResult>("/discovery/openclaw");
      setDiscoverResult(data);
      if (data.status === "found") {
        if (data.url) setUrl(data.url);
        if (data.token) setToken(data.token);
        if (data.password) setPassword(data.password);
      }
    } catch {
      setDiscoverResult({ status: "not_found", reason: "config_missing" });
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("login.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("login.subtitle")}</p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDiscover}
            disabled={discovering}
            className="w-full py-2 px-4 border border-input rounded-md text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
          >
            {discovering ? t("login.discovering") : t("login.discover")}
          </button>
          {discoverResult && (
            <div
              className={`text-xs p-2 rounded-md ${
                discoverResult.status === "found"
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {discoverResult.status === "found"
                ? t("login.discoverFound")
                : discoverResult.reason === "docker_env"
                  ? t("login.discoverDocker")
                  : t("login.discoverNotFound")}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              {t("login.url")}
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("login.urlPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">
              {t("login.token")}
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("login.tokenPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t("login.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("login.passwordPlaceholder")}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("login.credentialHint")}</p>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
