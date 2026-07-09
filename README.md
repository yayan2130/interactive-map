# Interactive Map — KidZania Surabaya

Aplikasi peta lantai interaktif (single-page app) untuk KidZania Surabaya. Pengunjung dapat berpindah antara Lantai 1 dan Lantai 2, lalu mengetuk sebuah establishment di peta untuk melihat detailnya — deskripsi dwibahasa (Indonesia/Inggris), foto, video, serta jadwal aktivitas langsung ("Now" / "10 min") yang diambil dari sistem census KidZania.

Dibangun dengan **React 18 + TypeScript + Vite 4**, ditata dengan **Tailwind CSS 4**, dan dapat dipasang sebagai **PWA** (installable, dengan caching offline via `vite-plugin-pwa`).

## Fitur utama

- **Peta interaktif berbasis data** — setiap zona adalah area klik yang diposisikan dengan persentase di atas gambar denah (`public/1ST FLOOR.png` / `public/2ND FLOOR.png`). Menambah zona cukup dengan menambahkan objek ke [src/zones/firstFloor.ts](src/zones/firstFloor.ts) atau [src/zones/secondFloor.ts](src/zones/secondFloor.ts) — tidak perlu mengubah komponen.
- **Badge jadwal langsung** — setiap zona menampilkan badge siklus aktivitas terdekat. Data berasal dari scraper SOAP yang menulis snapshot ke `public/census.json`, lalu di-poll oleh frontend setiap 60 detik.
- **Detail zona dalam popup modal** — deskripsi ID/EN, daftar siklus berikutnya per establishment, foto, video, dan tautan info yang dibuka dalam iframe di dalam aplikasi.
- **PWA** — app shell dan denah di-precache; `census.json` sengaja tidak pernah di-cache agar data jadwal selalu segar.

## Prasyarat

- **Node.js 18+** (scraper memakai `fetch` bawaan Node)
- npm

## Cara menjalankan

### 1. Instal dependensi

```bash
npm install
```

### 2. Jalankan server development

```bash
npm run dev
```

Vite berjalan di port **5173** dengan flag `--host`, sehingga bisa diakses juga dari perangkat lain di jaringan lokal (mis. `http://<ip-komputer>:5173`).

> Tanpa data census, peta tetap berfungsi — hanya badge jadwal yang kosong. Untuk mengaktifkan jadwal langsung, jalankan scraper (langkah 3).

### 3. (Opsional) Aktifkan data jadwal langsung

Scraper membutuhkan kredensial SOAP KidZania yang **tidak** ikut di-commit:

1. Salin [scraper/credentials.example.json](scraper/credentials.example.json) menjadi `scraper/credentials.json`.
2. Isi `auth.username` dan `auth.password` (endpoint sudah terisi). Opsi lain: `pollIntervalMs` (default 60000 ms) dan `outputPath` (default `public/census.json`).

Lalu jalankan:

```bash
# sekali jalan
npm run scrape:census

# atau polling terus-menerus (interval dari credentials.json)
npm run scrape:census:watch
```

Di Windows, `start-poller.bat` membungkus mode watch dengan pengecekan Node dan kredensial. Biarkan poller berjalan berdampingan dengan `npm run dev` — frontend otomatis membaca `public/census.json` yang terus diperbarui.

### 4. Build produksi

```bash
npm run build
npm run preview   # uji hasil build secara lokal
```

> **Penting:** base path build **di-hardcode ke `/interactive-map/`**. Hasil build di folder `dist/` harus di-deploy pada sub-path tersebut (mis. `https://domain.com/interactive-map/`), kalau tidak URL aset dan `census.json` akan rusak. Ini juga berlaku untuk PWA yang terpasang. Di server produksi, jalankan poller census secara terjadwal agar `census.json` di folder deploy tetap segar.

## Struktur singkat

| Path | Isi |
| --- | --- |
| `src/zones/` | Definisi zona per lantai (posisi, deskripsi, media, tautan establishment) |
| `src/components/` | `InteractiveMap` (peta + badge) dan `SidePanel` (popup modal detail zona) |
| `src/utils/census.ts` | Hook `useCensus()` — polling `census.json` |
| `scraper/fetchCensus.js` | Scraper SOAP → `public/census.json` |
| `public/` | Denah lantai, gambar/video establishment, latar halaman |

Dokumentasi arsitektur yang lebih rinci ada di [CLAUDE.md](CLAUDE.md).
