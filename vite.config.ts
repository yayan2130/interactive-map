import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // scope/start_url derive from Vite `base` (/interactive-map/ at build time).
      includeAssets: ["kz-logo.png", "1ST FLOOR.png", "2ND FLOOR.png"],
      manifest: {
        name: "KidZania Surabaya — Interactive Map",
        short_name: "KZ Map",
        description:
          "Interactive building map of KidZania Surabaya. Switch floors and tap a zone to view its details and live activity cycles.",
        theme_color: "#dc2626",
        background_color: "#dc2626",
        display: "standalone",
        orientation: "any",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache only the app shell. Floor maps + logo come in via includeAssets.
        globPatterns: ["**/*.{js,css,html,svg}", "1ST FLOOR.png", "2ND FLOOR.png", "kz-logo.png"],
        // Live data and the bulk image folders are NOT precached.
        globIgnores: ["**/census.json", "**/establishment/**", "**/activity/**"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/census\.json/],
        runtimeCaching: [
          {
            // Live census data — always hit the network, never serve from cache.
            urlPattern: /census\.json/,
            handler: "NetworkOnly",
          },
          {
            // Zone images load and cache on demand as zones are visited.
            urlPattern: /\/(establishment|activity)\/.*\.(png|jpe?g|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "zone-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // ⬅️ penting
    port: 5173,
  },
});
