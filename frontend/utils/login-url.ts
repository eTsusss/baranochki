/** Относительный путь `/login` с учётом `BASE_URL` — одинаков на SSR и клиенте (нет mismatch при `<a href>`). */
export function loginLogoutPath(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const path = `${base}/login`.replace(/\/+/g, "/");
  return path.startsWith("/") ? path : `/${path}`;
}

/** Полный URL — только на клиенте; для редиректа лучше `loginLogoutPath` + `location.assign`. */
export function loginAbsoluteUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${loginLogoutPath()}`;
}
