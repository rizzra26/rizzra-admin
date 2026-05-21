import { defineStore } from "pinia";

const COOKIE_NAME = "auth_token";

function setAuthCookie(token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${token}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    refreshToken: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    initialize() {
      if (import.meta.client) {
        this.token = localStorage.getItem("access_token");
        this.refreshToken = localStorage.getItem("refresh_token");
        const u = localStorage.getItem("user");
        if (u) {
          try {
            this.user = JSON.parse(u);
          } catch {}
        }
      }
    },

    async login(email: string, password: string) {
      const apiBase = useRuntimeConfig().public.apiBaseUrl;
      const resp = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) throw new Error("Invalid credentials");
      const json = await resp.json();
      const data = json.data;
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      if (import.meta.client) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuthCookie(data.access_token);
      }
    },

    async refresh(): Promise<boolean> {
      if (!this.refreshToken) return false;
      try {
        const apiBase = useRuntimeConfig().public.apiBaseUrl;
        const resp = await fetch(`${apiBase}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
        if (!resp.ok) return false;
        const json = await resp.json();
        const data = json.data;
        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        if (import.meta.client) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          setAuthCookie(data.access_token);
        }
        return true;
      } catch {
        return false;
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        clearAuthCookie();
      }
      navigateTo("/login");
    },
  },
});
