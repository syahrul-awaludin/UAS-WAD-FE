import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Semua request ke /api/... diteruskan ke backend
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      // Semua request ke /auth/... diteruskan ke backend
      "/auth": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      // Proxy untuk Socket.IO
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
