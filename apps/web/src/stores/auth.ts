import { create } from "zustand";
import { TOKEN_KEY, GATEWAY_ID_KEY } from "@openclaw/shared";

interface AuthState {
  gatewayId: string | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, gatewayId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  gatewayId: localStorage.getItem(GATEWAY_ID_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  setAuth: (accessToken, gatewayId) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(GATEWAY_ID_KEY, gatewayId);
    set({ gatewayId, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GATEWAY_ID_KEY);
    set({ gatewayId: null, isAuthenticated: false });
  },
}));
