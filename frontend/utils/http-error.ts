import type { FetchError } from "ofetch";

export function fetchHttpStatus(err: unknown): number | undefined {
  const e = err as FetchError & { status?: number };
  if (typeof e.statusCode === "number") return e.statusCode;
  if (typeof e.status === "number") return e.status;
  const r = e.response as { status?: number } | undefined;
  if (r && typeof r.status === "number") return r.status;
  return undefined;
}

/** Тело ошибки FastAPI (detail) или сообщение сети */
export function formatFetchDetail(err: unknown): string {
  const e = err as FetchError & { data?: { detail?: unknown } };
  const d = e.data?.detail;
  if (d !== undefined && d !== null) {
    if (typeof d === "string") return d;
    if (Array.isArray(d))
      return d
        .map((item: unknown) => (typeof item === "object" && item !== null ? JSON.stringify(item) : String(item)))
        .join("; ");
    return JSON.stringify(d);
  }
  return e.message || "Запрос не выполнен";
}
