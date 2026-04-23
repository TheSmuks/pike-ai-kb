import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60_000,
    coverage: {
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
