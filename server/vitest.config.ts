import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    reporters: ["verbose"],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    hookTimeout: 60000,
    testTimeout: 60000,
    fileParallelism: false,
    include: ["test/**/*.spec.ts"],
    exclude: ["dist/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage"
    }
  }
});
