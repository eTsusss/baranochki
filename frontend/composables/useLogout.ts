/** Полный выход: Pinia + localStorage и переход на главную без SPA (надёжно после SSR/Pinia). */
export function logoutRedirectHome() {
  const auth = useAuthStore();
  auth.logout();
  if (import.meta.client) {
    window.location.href = "/";
  }
}
