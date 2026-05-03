import type { H3Event } from "h3";
import { publicBackendHealthUrl } from "../../utils/backend-health";

let warnedLocalhostUpstream = false;

/** Тот же базовый URL API, что и у прокси `/api/be/*`. */
export function resolveApiBase(event?: H3Event): string {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig();
  const resolved =
    String(config.apiUpstream || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(config.public.apiBase || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(process.env.NUXT_PUBLIC_API_BASE || "")
      .trim()
      .replace(/\/+$/, "") ||
    "http://127.0.0.1:8000/api";

  if (
    !warnedLocalhostUpstream &&
    process.env.NODE_ENV === "production" &&
    /127\.0\.0\.1|localhost/i.test(resolved)
  ) {
    warnedLocalhostUpstream = true;
    console.warn(
      "[confeti] API upstream указывает на localhost — задайте NUXT_PUBLIC_API_BASE (или NUXT_API_UPSTREAM) " +
        "в переменных окружения **сервиса фронта** на Render, иначе прокси и wake не достучатся до бэка."
    );
  }

  return resolved;
}

/** FastAPI отдаёт `/health` на корне сервиса (не под `/api`). */
export function backendHealthUrl(apiBase: string): string {
  return publicBackendHealthUrl(apiBase);
}
