import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  worker: {
    format: "es",
  },
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [["@babel/plugin-proposal-decorators", { version: "2023-11" }]],
        overrides: [
          {
            // Make sure to exclude all components that use @react-pdf/renderer from signals transform.
            //exclude:
            //  /StatisticsVhpPdfDocument|PdfTable|PdfPageHeader|PdfShiftCommentsTable|StatisticsShiftCommentsPdfDocument|StatisticsDailyReportPdfDocument/,
            plugins: [["module:@preact/signals-react-transform"]],
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: "buffer", replacement: "buffer/" },
      { find: "@/*", replacement: path.resolve(__dirname, "src/*") },
    ],
  },
});
