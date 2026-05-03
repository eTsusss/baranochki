/** Полный выход: чистим хранилища, сбрасываем Pinia, затем жёсткая перезагрузка главной. */
export function logoutRedirectHome(): void {
  if (!import.meta.client) return;

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore */
  }

  try {
    const auth = useAuthStore();
    auth.$patch({ token: "", role: "guest" });
    auth.logout();
  } catch {
    /* ignore */
  }

  const dest = `${window.location.origin}/`;
  setTimeout(() => {
    window.location.href = dest;
  }, 0);
}
