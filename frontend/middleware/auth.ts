import { decodeJwtPayload } from "../utils/jwt";

export default defineNuxtRouteMiddleware((to) => {
  const ADMIN_PATH = "/cabinet-upravleniya-87";
  if (process.server) return;
  const token = localStorage.getItem("token");
  if (!token) return navigateTo("/login", { replace: true });
  if (to.path.startsWith(ADMIN_PATH)) {
    const payload = decodeJwtPayload(token);
    const role = payload?.role;
    if (!payload || role !== "admin") {
      return navigateTo("/", { replace: true });
    }
  }
});
