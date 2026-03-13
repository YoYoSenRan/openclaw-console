import { Routes, Route, Navigate } from "react-router";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/login/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AgentsPage from "@/pages/agents/AgentsPage";
import SessionsPage from "@/pages/sessions/SessionsPage";
import SkillsPage from "@/pages/skills/SkillsPage";
import GatewayPage from "@/pages/gateway/GatewayPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/gateway" element={<GatewayPage />} />
      </Route>
    </Routes>
  );
}
