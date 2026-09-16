import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Forwards /api requests to the Express backend during local
    // development so the browser sees everything as same-origin — no CORS
    // configuration needed on either side. Override the target with
    // VITE_PROXY_TARGET if the backend runs somewhere other than :3000.
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
