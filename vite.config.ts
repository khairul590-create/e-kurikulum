import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "E-Kurikulum — Pengurusan Kurikulum Sekolah",
        short_name: "E-Kurikulum",
        description: "Sistem pengurusan kurikulum sekolah rendah KSSR",
        theme_color: "#0F2A4A",
        background_color: "#F4F6FB",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Supabase API calls must NOT be cached — student data must not persist in browser
            urlPattern: ({ url }) =>
              url.hostname.endsWith(".supabase.co") ||
              url.pathname.startsWith("/rest/v1") ||
              url.pathname.startsWith("/auth/v1"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    sourcemap: false,
  },
  esbuild: {
    // Strip console.* and debugger from production builds
    drop: ["console", "debugger"],
  },
});
