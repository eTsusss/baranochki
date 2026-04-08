import { decodeJwtPayload } from "../utils/jwt";

export default defineNuxtRouteMiddleware((to) => {
  const ADMIN_PATH = "/cabinet-upravleniya-87";
  if (process.server) return;
  const token = localStorage.getItem("token");
  if (!token) return navigateTo("/login");
  if (to.path.startsWith(ADMIN_PATH)) {
    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      return navigateTo("/");
    }
  }
});
