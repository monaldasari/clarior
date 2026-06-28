import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/customers": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/leads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/tasks": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/dashboard": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/reports": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/activity-logs": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/setup-db": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});