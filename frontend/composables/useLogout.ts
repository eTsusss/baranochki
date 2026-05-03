/** Общий выход: очистить Pinia + localStorage и уйти на главную */
export async function logoutRedirectHome() {
  const auth = useAuthStore();
  auth.logout();
  await navigateTo("/", { replace: true });
}
