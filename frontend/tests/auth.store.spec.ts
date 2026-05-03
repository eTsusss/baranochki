import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../stores/auth";

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", {
      setItem: vi.fn(),
      getItem: vi.fn(() => ""),
      removeItem: vi.fn()
    });
  });

  it("sets token and role", () => {
    const auth = useAuthStore();
    const payload = Buffer.from(JSON.stringify({ role: "admin" })).toString("base64");
    auth.setToken(`x.${payload}.x`);
    expect(auth.token).toContain("x.");
    expect(auth.role).toBe("admin");
  });

  it("logout resets state", () => {
    const auth = useAuthStore();
    auth.token = "t";
    auth.role = "admin";
    auth.logout();
    expect(auth.token).toBe("");
    expect(auth.role).toBe("guest");
  });

  it("rejects malformed token and clears storage", () => {
    const auth = useAuthStore();
    auth.setToken("not-a-jwt");
    expect(auth.token).toBe("");
    expect(auth.role).toBe("guest");
  });

  it("rejects expired token", () => {
    const auth = useAuthStore();
    const past = Math.floor(Date.now() / 1000) - 3600;
    const payload = Buffer.from(JSON.stringify({ role: "admin", sub: "u@test.ru", exp: past })).toString(
      "base64"
    );
    auth.setToken(`h.${payload}.t`);
    expect(auth.token).toBe("");
    expect(auth.role).toBe("guest");
  });
});
