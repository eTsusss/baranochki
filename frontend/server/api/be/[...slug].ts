/**
 * Прокси к реальному API (тот же origin в браузере → нет CORS).
 * proxyRequest сохраняет тело POST/PUT/PATCH; прежний вариант с readBody+$fetch мог ломать мутации.
 */
import { getProxyRequestHeaders, getRequestURL, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const upstream =
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

  const slugRaw = getRouterParam(event, "slug");
  const slugStr = Array.isArray(slugRaw) ? slugRaw.join("/") : String(slugRaw ?? "");
  const suffix = slugStr.replace(/^\/+/, "");
  const reqUrl = getRequestURL(event);
  const path = suffix ? `/${suffix}` : "";
  const target = `${upstream.replace(/\/+$/, "")}${path}${reqUrl.search || ""}`;

  return proxyRequest(event, target, {
    fetch: globalThis.fetch,
    headers: getProxyRequestHeaders(event)
  });
});
