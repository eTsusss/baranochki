import { loginLogoutPath } from "~/utils/login-url";

/**
 * Выход без вызова Pinia до редиректа (см. watcher на админ-странице).
 * Относительный путь — надёжнее абсолютного URL; навигация видна в Network как тип «document», не fetch.
 */
export function logoutRedirectHome(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore */
  }

  window.location.assign(loginLogoutPath());
}
