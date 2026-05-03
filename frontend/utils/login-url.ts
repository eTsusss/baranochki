/** Полный URL `/login` с учётом `import.meta.env.BASE_URL` (подпуть деплоя). */
export function loginAbsoluteUrl(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const path = `${base}/login`.replace(/\/+/g, "/");
  return `${origin}${path}`;
}
