/**
 * Прокси к реальному API: браузер ходит на тот же origin (/api/be/…),
 * Nitro пересылает на backend — без CORS/preflight между двумя *.onrender.com.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const upstream =
    String(config.apiUpstream || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(process.env.NUXT_PUBLIC_API_BASE || "")
      .trim()
      .replace(/\/+$/, "") ||
    "http://127.0.0.1:8000/api";

  const slugParam = getRouterParam(event, "slug") ?? "";
  const suffix = String(slugParam).replace(/^\/+/, "");
  const reqUrl = getRequestURL(event);
  const target = suffix ? `${upstream}/${suffix}${reqUrl.search}` : `${upstream}${reqUrl.search}`;

  const method = getMethod(event);
  const incoming = getRequestHeaders(event);
  const headers: Record<string, string> = {
    accept: incoming.accept || "application/json"
  };
  const auth = incoming.authorization;
  if (auth) headers.authorization = auth;
  const ct = incoming["content-type"];
  if (ct && !["GET", "HEAD"].includes(method)) headers["content-type"] = ct;

  try {
    if (method === "GET" || method === "HEAD") {
      return await $fetch(target, { method, headers });
    }

    let body: unknown = undefined;
    if (method !== "DELETE") {
      body = await readBody(event).catch(() => undefined);
    }

    return await $fetch(target, { method, headers, body });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; status?: number; data?: unknown; message?: string };
    throw createError({
      statusCode: e.statusCode || e.status || 502,
      statusMessage: e.message || "Upstream API error",
      data: e.data
    });
  }
});
