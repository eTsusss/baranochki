/** Корень сервиса FastAPI из NUXT_PUBLIC_API_BASE (…/api → …). */
export function publicBackendRoot(apiBase: string): string {
  return String(apiBase || "").trim().replace(/\/+$/, "").replace(/\/api$/, "") || "";
}

export function publicBackendHealthUrl(apiBase: string): string {
  const root = publicBackendRoot(apiBase);
  return root ? `${root}/health` : "";
}
