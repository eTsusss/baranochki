import { resolveApiBase } from "../utils/backend-base";

/**
 * GET /api/confeti-diag — без секретов: видит ли сервер переменные и куда смотрит прокси.
 * Удалить при желании после отладки.
 */
export default defineEventHandler((event) => {
  const resolved = resolveApiBase(event);
  const bad = /127\.0\.0\.1|localhost/i.test(resolved);
  return {
    proxyPointsToRemote: !bad,
    envPublicLen: String(process.env.NUXT_PUBLIC_API_BASE || "").trim().length,
    envUpstreamLen: String(process.env.NUXT_API_UPSTREAM || "").trim().length,
    configPublicLen: String(useRuntimeConfig(event).public.apiBase || "").trim().length
  };
});
