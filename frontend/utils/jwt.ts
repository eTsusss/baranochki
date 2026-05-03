function decodeBase64Utf8(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  if (typeof globalThis.atob === "function") {
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  const BufferCtor = (globalThis as unknown as { Buffer?: { from(s: string, enc: string): { toString(enc: string): string } } }).Buffer;
  if (BufferCtor) return BufferCtor.from(padded, "base64").toString("utf8");
  return "";
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const decoded = decodeBase64Utf8(part);
    if (!decoded) return null;
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
