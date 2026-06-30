import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reportsMiddleware } from "./server/reports-api.js";

function reportsApiPlugin() {
  return {
    name: "reports-api",
    configureServer(server) {
      server.middlewares.use(reportsMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(reportsMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), reportsApiPlugin()],
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
  },
});
