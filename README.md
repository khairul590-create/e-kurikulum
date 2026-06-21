# E-Kurikulum — Sistem Pengurusan Kurikulum Sekolah Rendah

Web app + PWA untuk urus kurikulum sekolah rendah (KSSR): dashboard, RPH, pentaksiran,
pencapaian murid, analisis, pengurusan murid/guru/kelas. Navy-blue, responsive, full CRUD.

**Stack:** React 18 · TypeScript · Vite · Tailwind · TanStack Query/Table · Recharts ·
Radix UI · React Router · Supabase (Postgres + Auth + RLS) · vite-plugin-pwa.

---

## Setup

### 1. Pasang dependency
```bash
npm install
```

### 2. Supabase

**Pilihan A — Local (perlu Docker Desktop berjalan):**
```bash
supabase start          # naikkan Postgres + Auth + Studio
supabase db reset       # jalankan migrations + seed.sql
```
`supabase start` cetak `API URL` + `anon key`. Salin ke `.env.local`.

**Pilihan B — Supabase Cloud:**
1. Buat projek di https://supabase.com
2. SQL Editor → jalankan ikut urutan: `supabase/migrations/0001_schema.sql`,
   `0002_rls.sql`, `0003_views.sql`, kemudian `supabase/seed.sql`.
3. Settings → API → salin `Project URL` + `anon public key`.

### 3. Env
```bash
cp .env.local.example .env.local
# isi VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

### 4. Run
```bash
npm run dev       # http://localhost:5173
npm run build     # build produksi + PWA service worker
npm run preview   # uji build
```

---

## Akaun Demo (selepas seed)

| Peranan | Emel | Kata Laluan |
|---------|------|-------------|
| Pentadbir (admin) | `admin@kurikulum.test` | `password123` |
| Guru | `cikgu.ahmad@kurikulum.test` | `password123` |
| Guru lain | `guru1@kurikulum.test` … `guru40@…` | `password123` |

Seed isi: 13 mata pelajaran, 42 guru, 762 murid, 24 kelas, ~1402 RPH (89% selesai),
60 pentaksiran + skor (purata ~78%) — sepadan mockup.

---

## Peranan & Akses (RLS)

- **Admin** — akses penuh semua modul (murid, guru, kelas, subjek, bilik, tetapan, pengumuman).
- **Guru** — lihat semua data; tulis hanya RPH / PdP / Pentaksiran **milik sendiri**
  (`guru_id = auth.uid()`, dikuatkuasakan di peringkat pangkalan data).

---

## Struktur

```
supabase/migrations  — skema, RLS, views
supabase/seed.sql    — data contoh
src/components/ui     — kit UI (Button, Card, Dialog, Toast, …)
src/components/crud   — enjin CRUD generik (CrudPage, DataTable)
src/components/charts — Donut/Line/Bar + StatCard
src/components/layout — Sidebar, Topbar, AppShell (responsive)
src/features/*        — 17 modul (dashboard, rph, pentaksiran, murid, …)
src/routes            — router + ProtectedRoute + RoleGate
```

## PWA
Installable, offline shell (Workbox). Manifest + ikon di `public/`. `npm run build`
jana `dist/sw.js`. Uji install/offline guna `npm run preview` + Lighthouse.

## Nota
- Cipta akaun guru baru sebenar perlu lalui Supabase Auth (sign-up / Admin API);
  borang "Guru" mengemaskini profil sedia ada sahaja.
- Bundle utama besar (recharts) — boleh dioptimumkan dengan manualChunks jika perlu.
