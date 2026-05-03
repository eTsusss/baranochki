import { getRequestURL } from "h3";
import { backendHealthUrl, resolveApiBase } from "../utils/backend-base";

const STATIC_EXT = /\.(js|mjs|css|map|woff2?|ttf|eot|ico|png|jpe?g|svg|gif|webp|json)$/i;

function shouldPingBackend(pathname: string): boolean {
  if (pathname.startsWith("/_nuxt/")) return false;
  if (pathname.startsWith("/api/be/")) return false;
  if (pathname === "/api/wake-backend") return false;
  if (STATIC_EXT.test(pathname)) return false;
  return true;
}

/**
 * Render и аналоги: фронт и бэк — разные сервисы. Первый запрос к фронту
 * не бодрит бэк. Лёгкий GET /health в фоне даёт бэку стартовать параллельно с SSR.
 */
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (!shouldPingBackend(path)) return;

  const url = backendHealthUrl(resolveApiBase(event));
  void fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(25_000)
  }).catch(() => {});
});
