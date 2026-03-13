import { create } from "zustand";
import type { UserInfo } from "@openclaw/shared";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "@openclaw/shared";

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setAuth: (user: UserInfo, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
