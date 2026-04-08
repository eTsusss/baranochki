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
});
