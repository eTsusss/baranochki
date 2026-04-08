import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.spec.ts"],
    exclude: ["tests/e2e/**"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: ["stores/*.ts"]
    }
  }
});
