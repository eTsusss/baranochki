/** Выход: очистить хранилища и принудительно перезагрузить главную (на том же origin). */
export function logoutRedirectHome(): void {
  if (!import.meta.client) return;

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore private mode / quota */
  }

  const auth = useAuthStore();
  auth.logout();

  const root = `${window.location.origin}/`;
  window.location.replace(root);
}
