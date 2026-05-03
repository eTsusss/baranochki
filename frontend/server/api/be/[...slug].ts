/**
 * Прокси к реальному API (тот же origin в браузере → нет CORS).
 * proxyRequest сохраняет тело POST/PUT/PATCH; прежний вариант с readBody+$fetch мог ломать мутации.
 */
import { getProxyRequestHeaders, getRequestURL, proxyRequest } from "h3";
import { resolveApiBase } from "../../utils/backend-base";

export default defineEventHandler((event) => {
  const upstream = resolveApiBase(event);

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
