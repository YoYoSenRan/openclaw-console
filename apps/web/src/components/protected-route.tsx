import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/lib/api";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    api
      .get("/auth/status")
      .then(() => setValid(true))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [isAuthenticated, logout]);

  if (checking) {
    return null;
  }

  if (!isAuthenticated || !valid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
