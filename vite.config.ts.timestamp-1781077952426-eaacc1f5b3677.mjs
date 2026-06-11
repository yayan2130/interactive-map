// vite.config.ts
import { defineConfig } from "file:///D:/Janu/vite-app/interactive_map/interactive-map/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Janu/vite-app/interactive_map/interactive-map/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///D:/Janu/vite-app/interactive_map/interactive-map/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // scope/start_url derive from Vite `base` (/interactive-map/ at build time).
      includeAssets: ["kz-logo.png", "1ST FLOOR.png", "2ND FLOOR.png"],
      manifest: {
        name: "KidZania Surabaya \u2014 Interactive Map",
        short_name: "KZ Map",
        description: "Interactive building map of KidZania Surabaya. Switch floors and tap a zone to view its details and live activity cycles.",
        theme_color: "#dc2626",
        background_color: "#dc2626",
        display: "standalone",
        orientation: "any",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
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
            handler: "NetworkOnly"
          },
          {
            // Zone images load and cache on demand as zones are visited.
            urlPattern: /\/(establishment|activity)\/.*\.(png|jpe?g|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "zone-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    // ⬅️ penting
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxKYW51XFxcXHZpdGUtYXBwXFxcXGludGVyYWN0aXZlX21hcFxcXFxpbnRlcmFjdGl2ZS1tYXBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEphbnVcXFxcdml0ZS1hcHBcXFxcaW50ZXJhY3RpdmVfbWFwXFxcXGludGVyYWN0aXZlLW1hcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovSmFudS92aXRlLWFwcC9pbnRlcmFjdGl2ZV9tYXAvaW50ZXJhY3RpdmUtbWFwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICAvLyBzY29wZS9zdGFydF91cmwgZGVyaXZlIGZyb20gVml0ZSBgYmFzZWAgKC9pbnRlcmFjdGl2ZS1tYXAvIGF0IGJ1aWxkIHRpbWUpLlxuICAgICAgaW5jbHVkZUFzc2V0czogW1wia3otbG9nby5wbmdcIiwgXCIxU1QgRkxPT1IucG5nXCIsIFwiMk5EIEZMT09SLnBuZ1wiXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6IFwiS2lkWmFuaWEgU3VyYWJheWEgXHUyMDE0IEludGVyYWN0aXZlIE1hcFwiLFxuICAgICAgICBzaG9ydF9uYW1lOiBcIktaIE1hcFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIkludGVyYWN0aXZlIGJ1aWxkaW5nIG1hcCBvZiBLaWRaYW5pYSBTdXJhYmF5YS4gU3dpdGNoIGZsb29ycyBhbmQgdGFwIGEgem9uZSB0byB2aWV3IGl0cyBkZXRhaWxzIGFuZCBsaXZlIGFjdGl2aXR5IGN5Y2xlcy5cIixcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiI2RjMjYyNlwiLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiNkYzI2MjZcIixcbiAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXG4gICAgICAgIG9yaWVudGF0aW9uOiBcImFueVwiLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJwd2EtMTkyeDE5Mi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwicHdhLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcInB3YS01MTJ4NTEyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgLy8gUHJlY2FjaGUgb25seSB0aGUgYXBwIHNoZWxsLiBGbG9vciBtYXBzICsgbG9nbyBjb21lIGluIHZpYSBpbmNsdWRlQXNzZXRzLlxuICAgICAgICBnbG9iUGF0dGVybnM6IFtcIioqLyoue2pzLGNzcyxodG1sLHN2Z31cIiwgXCIxU1QgRkxPT1IucG5nXCIsIFwiMk5EIEZMT09SLnBuZ1wiLCBcImt6LWxvZ28ucG5nXCJdLFxuICAgICAgICAvLyBMaXZlIGRhdGEgYW5kIHRoZSBidWxrIGltYWdlIGZvbGRlcnMgYXJlIE5PVCBwcmVjYWNoZWQuXG4gICAgICAgIGdsb2JJZ25vcmVzOiBbXCIqKi9jZW5zdXMuanNvblwiLCBcIioqL2VzdGFibGlzaG1lbnQvKipcIiwgXCIqKi9hY3Rpdml0eS8qKlwiXSxcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogXCJpbmRleC5odG1sXCIsXG4gICAgICAgIG5hdmlnYXRlRmFsbGJhY2tEZW55bGlzdDogWy9jZW5zdXNcXC5qc29uL10sXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy8gTGl2ZSBjZW5zdXMgZGF0YSBcdTIwMTQgYWx3YXlzIGhpdCB0aGUgbmV0d29yaywgbmV2ZXIgc2VydmUgZnJvbSBjYWNoZS5cbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9jZW5zdXNcXC5qc29uLyxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiTmV0d29ya09ubHlcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIFpvbmUgaW1hZ2VzIGxvYWQgYW5kIGNhY2hlIG9uIGRlbWFuZCBhcyB6b25lcyBhcmUgdmlzaXRlZC5cbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9cXC8oZXN0YWJsaXNobWVudHxhY3Rpdml0eSlcXC8uKlxcLihwbmd8anBlP2d8d2VicCkkL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiBcIkNhY2hlRmlyc3RcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcInpvbmUtaW1hZ2VzXCIsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAyMDAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAsIC8vIDMwIGRheXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IHRydWUsIC8vIFx1MkIwNVx1RkUwRiBwZW50aW5nXG4gICAgcG9ydDogNTE3MyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VSxTQUFTLG9CQUFvQjtBQUN6VyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQTtBQUFBLE1BRWQsZUFBZSxDQUFDLGVBQWUsaUJBQWlCLGVBQWU7QUFBQSxNQUMvRCxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUNFO0FBQUEsUUFDRixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQTtBQUFBLFFBRVAsY0FBYyxDQUFDLDBCQUEwQixpQkFBaUIsaUJBQWlCLGFBQWE7QUFBQTtBQUFBLFFBRXhGLGFBQWEsQ0FBQyxrQkFBa0IsdUJBQXVCLGdCQUFnQjtBQUFBLFFBQ3ZFLGtCQUFrQjtBQUFBLFFBQ2xCLDBCQUEwQixDQUFDLGNBQWM7QUFBQSxRQUN6QyxnQkFBZ0I7QUFBQSxVQUNkO0FBQUE7QUFBQSxZQUVFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBO0FBQUEsWUFFRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZO0FBQUEsZ0JBQ1YsWUFBWTtBQUFBLGdCQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLGNBQ2hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
