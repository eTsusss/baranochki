/**
 * Серверный middleware бодрит бэк только при запросе HTML к Nitro.
 * При переходах NuxtLink запрос остаётся в браузере — без пинга бэк на Render не просыпается.
 *
 * Дополнительно: прямой fetch на https://<бэк>/health из браузера (CORS у FastAPI открыт).
 * Так запрос точно попадает на ваш бэкенд, даже если прокси фронта билдился без NUXT_PUBLIC_API_BASE.
 */
import { publicBackendHealthUrl } from "~/utils/backend-health";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const router = useRouter();
  let lastWakeAt = 0;
  const throttleMs = 10_000;

  function pingWakeBackend() {
    const now = Date.now();
    if (now - lastWakeAt < throttleMs) return;
    lastWakeAt = now;

    const health = publicBackendHealthUrl(String(config.public.apiBase || ""));
    if (health) {
      void fetch(health, {
        mode: "cors",
        cache: "no-store",
        signal: AbortSignal.timeout(25_000)
      }).catch(() => {});
    }

    void $fetch("/api/wake-backend", { timeout: 26_000 }).catch(() => {});
  }

  pingWakeBackend();
  router.afterEach(() => {
    pingWakeBackend();
  });
});
