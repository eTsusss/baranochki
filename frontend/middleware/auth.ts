import { decodeJwtPayload, isJwtExpired } from "../utils/jwt";

export default defineNuxtRouteMiddleware((to) => {
  const ADMIN_PATH = "/cabinet-upravleniya-87";
  if (import.meta.server) return;

  const token = localStorage.getItem("token") || "";
  const payload = token ? decodeJwtPayload(token) : null;

  if (!token || !payload || isJwtExpired(payload)) {
    useAuthStore().logout();
    return navigateTo("/login", { replace: true });
  }

  /** Pinia после SSR может отставать от localStorage — выравниваем до рендера страницы */
  useAuthStore().setToken(token);

  if (to.path.startsWith(ADMIN_PATH) && payload.role !== "admin") {
    return navigateTo("/", { replace: true });
  }
});
