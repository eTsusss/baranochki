export default defineNuxtPlugin(() => {
  void $fetch("/api/wake-backend", { timeout: 26_000 }).catch(() => {});
});
