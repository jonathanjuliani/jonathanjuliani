import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/cards/**/*.test.ts"],
  },
});
