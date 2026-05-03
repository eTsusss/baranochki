/** Выход: чистим хранилища и Pinia, затем полная загрузка /login (обход глюков Vue Router). */
export function logoutRedirectHome(): void {
  if (!import.meta.client) return;

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore */
  }

  try {
    useAuthStore().logout();
  } catch {
    /* ignore */
  }

  const dest = `${window.location.origin}/login`;
  window.location.replace(dest);
}
