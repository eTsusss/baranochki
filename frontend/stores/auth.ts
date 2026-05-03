import { defineStore } from "pinia";
import { decodeJwtPayload, isJwtExpired } from "../utils/jwt";

export const useAuthStore = defineStore("auth", {
  state: () => ({ token: "", role: "guest" }),
  actions: {
    setToken(token: string) {
      const trimmed = token.trim();
      if (!trimmed) {
        this.logout();
        return;
      }
      const payload = decodeJwtPayload(trimmed);
      if (!payload || isJwtExpired(payload)) {
        this.token = "";
        this.role = "guest";
        if (process.client) localStorage.removeItem("token");
        return;
      }
      this.token = trimmed;
      this.role = typeof payload.role === "string" ? payload.role : "user";
      if (process.client) localStorage.setItem("token", trimmed);
    },
    load() {
      if (!process.client) return;
      const t = localStorage.getItem("token") || "";
      if (t) this.setToken(t);
    },
    logout() {
      this.token = "";
      this.role = "guest";
      if (process.client) localStorage.removeItem("token");
    }
  }
});
