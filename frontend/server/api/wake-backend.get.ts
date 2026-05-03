import { backendHealthUrl, resolveApiBase } from "../utils/backend-base";

/** Тот же origin, что и страница — удобно вызывать с клиента после гидратации. */
export default defineEventHandler(async (event) => {
  const url = backendHealthUrl(resolveApiBase(event));
  try {
    await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(25_000) });
    return { ok: true };
  } catch {
    return { ok: false };
  }
});
