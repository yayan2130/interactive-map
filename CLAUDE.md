# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (`--host`, port 5173, exposed on LAN).
- `npm run build` — production build. **Base path is hardcoded to `/interactive-map/`** (`vite build --base=/interactive-map/`); the app must be served from that sub-path or asset/`census.json` URLs break.
- `npm run preview` — serve the production build locally.
- `npm run lint` — runs `eslint .`, but the repo currently ships **no project-level ESLint config** (no `.eslintrc.*` / `eslint.config.*` at the root), so the command no-ops/errors until one is added.
- `npm run scrape:census` — run the census poller once.
- `npm run scrape:census:watch` — poll forever (interval from `credentials.json`, default 60s). On Windows, `start-poller.bat` wraps this with node/credential sanity checks.

There is no test suite.

## Architecture

A single-page React 18 + TypeScript 4.9 + Vite 4 app (styled with Tailwind CSS 4, installable as a PWA via vite-plugin-pwa): an interactive floor map of KidZania Surabaya. Two concerns dominate the codebase.

### 1. The map is data-driven from zone files

[src/zones/firstFloor.ts](src/zones/firstFloor.ts) and [src/zones/secondFloor.ts](src/zones/secondFloor.ts) export arrays of `Zone` objects ([src/types.ts](src/types.ts)). Each zone is an absolutely-positioned clickable region over a floor PNG (`public/1ST FLOOR.png` / `public/2ND FLOOR.png`):

- `top`/`left`/`width`/`height` are **percentages** of the map image, not pixels — [InteractiveMap.tsx](src/components/InteractiveMap.tsx) renders each zone as a `<button>` positioned with those percentages so the overlay scales with the image.
- Descriptions are bilingual (`description.id` / `description.en`); [SidePanel.tsx](src/components/SidePanel.tsx) toggles between Indonesian and English.
- Images/videos referenced by zones (`image`, `activity`, `video`) live under `public/` (e.g. `public/establishment/...`) and are referenced by relative URL. Other optional `Zone` fields: `rotate`/`videoPortrait` (orientation hints), `tags`.
- A zone can represent **two establishments at once** via `fib` + `fib2`, each with a display label (`fibLabel` / `fib2Label`, e.g. "Police Station" + "CSI"). Both feed census (see §2).

[App.tsx](src/App.tsx) holds all top-level state: selected zone, current floor (1|2), and search term. Search filters zones by name and passes matching ids to `InteractiveMap` as `highlightedZoneIds`. Adding a zone = appending an object to the relevant floor array; no component changes needed.

### 2. Live census ("next cycle") data flows scraper → JSON → polling hook

KidZania activity schedules ("Now" / "10 min" badges) come from external SOAP services, but the frontend never calls them directly. Instead:

1. [scraper/fetchCensus.js](scraper/fetchCensus.js) (Node 18+, ESM, uses global `fetch` + `fast-xml-parser`) authenticates against the KidZania auth SOAP service, then calls `GetCensusDisplay` once per establishment and writes a snapshot to `public/census.json`.
2. [src/utils/census.ts](src/utils/census.ts) `useCensus()` polls `census.json` every 60s (cache-busted) and returns a `CensusMap` keyed by `establishmentId`.
3. `InteractiveMap` shows a badge per zone (soonest cycle via `pickSoonest`); `SidePanel` lists all upcoming cycles.

`pickSoonest` reports "Now" only when **every** activity is idle, so a "Now" badge always means the whole zone is open and never hides an in-progress cycle. When a zone aggregates multiple activities the map badge appends a `×N` count, and `SidePanel` groups upcoming cycles per establishment, headed by `fibLabel` / `fib2Label` (falling back to "Info 1" / "Info 2").

**The establishmentId is the join key between the two systems.** The scraper does not have its own establishment list — it parses the zone `.ts` files with a regex, pairing each zone `id` with the `p=<hex>` value(s) in that zone's `fib`/`fib2` URLs. `loadEstablishments` harvests **all** `p=<hex>` values within a zone's block (so dual-establishment zones get both), and the frontend mirrors this: `getEstablishmentId` resolves the primary id (preferring an explicit `establishment_id` field, else the `fib` URL), `getSecondEstablishmentId` reads `fib2`, and `getEstablishmentIds` returns the combined list. So a zone only gets live data if its `fib`/`fib2` URL contains `...CensusDisplay?p=<hex>...`. The regex matches `id:` at exactly 4-space indentation to avoid catching the nested `description.id`; preserve that indentation in zone files.

The SOAP request/response shapes (envelopes, the token-in-response-header auth flow, nillable-field handling) are documented inline in `fetchCensus.js`.

### 3. PWA / offline caching

The app is an installable PWA via `vite-plugin-pwa` ([vite.config.ts](vite.config.ts), `registerType: "autoUpdate"`). The Workbox config encodes a deliberate freshness policy that mirrors the census design above:

- **App shell** (JS/CSS/HTML/SVG) + the two floor PNGs + logo are precached.
- **`census.json` is never cached** — `NetworkOnly` runtime caching plus `globIgnores`/`navigateFallbackDenylist` entries — so live data always hits the network (matching `useCensus`'s cache-busted `no-store` fetch).
- **Zone images** under `establishment/` and `activity/` are excluded from precache and instead `CacheFirst` on demand (cache `zone-images`, 200 entries / 30 days).

The manifest `scope`/`start_url` derive from Vite `base`, so the `/interactive-map/` sub-path requirement applies to the installed PWA too. When adding asset types or changing where live data lives, update the Workbox `globPatterns`/`globIgnores`/`runtimeCaching` accordingly or stale content will be served offline.

### 4. Styling & responsive layout

Styling is **Tailwind CSS** (`@tailwind base/components/utilities` in [src/index.css](src/index.css), wired through PostCSS via `@tailwindcss/postcss`). `index.css` also sets a fixed, full-bleed page background that swaps by viewport orientation: `public/map-bg.jpg` (landscape) and `public/map-bg-vertical.jpg` (portrait, via an `@media (orientation: portrait)` rule). The `--topbar-h` CSS variable reserves height for the floating topbar so the map's height budget stays deterministic.

### Secrets

`scraper/credentials.json` holds SOAP endpoints + credentials and is **gitignored**. Copy [scraper/credentials.example.json](scraper/credentials.example.json) and fill it in. `public/census.json` is also gitignored (regenerated by the poller).
