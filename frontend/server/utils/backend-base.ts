import type { H3Event } from "h3";

/** Тот же базовый URL API, что и у прокси `/api/be/*`. */
export function resolveApiBase(event?: H3Event): string {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig();
  return (
    String(config.apiUpstream || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(config.public.apiBase || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(process.env.NUXT_PUBLIC_API_BASE || "")
      .trim()
      .replace(/\/+$/, "") ||
    "http://127.0.0.1:8000/api"
  );
}

/** FastAPI отдаёт `/health` на корне сервиса (не под `/api`). */
export function backendHealthUrl(apiBase: string): string {
  const b = apiBase.replace(/\/+$/, "");
  const root = b.endsWith("/api") ? b.slice(0, -4) : b;
  return `${root.replace(/\/+$/, "")}/health`;
}
