/**
 * Серверный middleware бодрит бэк только при запросе HTML к Nitro.
 * При переходах NuxtLink запрос остаётся в браузере — без этого бэк не получает пинг.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();
  let lastWakeAt = 0;
  const throttleMs = 10_000;

  function pingWakeBackend() {
    const now = Date.now();
    if (now - lastWakeAt < throttleMs) return;
    lastWakeAt = now;
    void $fetch("/api/wake-backend", { timeout: 26_000 }).catch(() => {});
  }

  pingWakeBackend();
  router.afterEach(() => {
    pingWakeBackend();
  });
});
