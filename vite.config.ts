import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "./.cert/dev-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "./.cert/dev-cert.pem")),
    },
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy API calls to the Universal Model Detection backend.
      // The backend listens on 8081 by default (see package.json script).
      "/umd": {
        target: "http://localhost:8081",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/umd/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
