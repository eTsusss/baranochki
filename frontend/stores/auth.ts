import { defineStore } from "pinia";
import { decodeJwtPayload } from "../utils/jwt";

export const useAuthStore = defineStore("auth", {
  state: () => ({ token: "", role: "guest" }),
  actions: {
    setToken(token: string) {
      this.token = token;
      const payload = decodeJwtPayload(token);
      this.role = payload?.role || "user";
      if (process.client) localStorage.setItem("token", token);
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
