/**
 * Прямой fetch к API с другого origin (обходит особенности $fetch/Nitro при мутациях).
 */
export async function browserJsonFetch<T>(
  url: string,
  opts: {
    method?: string;
    bearer?: string | null;
    body?: unknown;
  } = {}
): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token = opts.bearer?.trim();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body,
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    referrerPolicy: "no-referrer"
  });

  const text = await res.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { detail: text };
    }
  } else {
    data = undefined;
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as Error & {
      statusCode?: number;
      status?: number;
      data?: unknown;
    };
    err.statusCode = res.status;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}
