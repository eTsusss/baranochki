import { loginAbsoluteUrl } from "~/utils/login-url";

/**
 * Выход без вызова Pinia до редиректа: на админ-странице watcher на `auth.token` делал navigateTo('/login')
 * и конфликтовал с полной перезагрузкой — казалось, что кнопка «Выйти» не работает.
 * Чистим только хранилища и уходим через replace (не SPA).
 */
export function logoutRedirectHome(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore */
  }

  window.location.replace(loginAbsoluteUrl());
}
