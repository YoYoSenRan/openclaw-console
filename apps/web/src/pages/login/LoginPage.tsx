import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth";
import http from "@/https";
import type { ConnectResponse } from "@openclaw/shared";
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

  const canSubmit = url && (token || password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await http.post<ConnectResponse>("/auth/connect", {
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
