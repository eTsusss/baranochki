import type { H3Event } from "h3";
import { publicBackendHealthUrl } from "../../utils/backend-health";

let warnedLocalhostUpstream = false;

function trimBase(s: string): string {
  return String(s || "").trim().replace(/\/+$/, "");
}

/**
 * URL бэкенда …/api для прокси `/api/be/*`.
 * Сначала читаем process.env: на Render он всегда есть в рантайме, даже если
 * кэш сборки «запёк» пустой public.apiBase в useRuntimeConfig().
 */
export function resolveApiBase(event?: H3Event): string {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig();
  const resolved =
    trimBase(process.env.NUXT_API_UPSTREAM || "") ||
    trimBase(process.env.NUXT_PUBLIC_API_BASE || "") ||
    trimBase(String(config.apiUpstream || "")) ||
    trimBase(String(config.public.apiBase || "")) ||
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
