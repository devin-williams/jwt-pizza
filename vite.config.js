import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

export default defineConfig(() => ({
  plugins: [
    istanbul({
      include: "src/**/*",
      exclude: ["node_modules", "tests/"],
      extension: [".js", ".jsx", ".ts", ".tsx"],
      requireEnv: false,
      forceBuildInstrument:
        process.env.CI === "true" || process.env.VITE_COVERAGE === "true",
    }),
  ],
  server: {
    port: 5173,
  },
}));
