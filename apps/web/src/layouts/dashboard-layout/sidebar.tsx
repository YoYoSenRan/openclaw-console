import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Bot, MessageSquare, Puzzle, Network, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/agents", labelKey: "nav.agents", icon: Bot },
  { to: "/sessions", labelKey: "nav.sessions", icon: MessageSquare },
  { to: "/skills", labelKey: "nav.skills", icon: Puzzle },
  { to: "/gateway", labelKey: "nav.gateway", icon: Network },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 border-r border-border bg-sidebar-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold text-sidebar-foreground">{t("app.title")}</h1>
        <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
