/** Собирает URL вида .../api/products без двойных слэшей */
export function joinApiBase(apiBase: string, ...pathSegments: string[]): string {
  let base = apiBase.trim().replace(/\/+$/, "");
  if (!base) base = "";
  for (const seg of pathSegments) {
    const p = seg.replace(/^\/+|\/+$/g, "");
    if (p) base = `${base}/${p}`;
  }
  return base;
}
