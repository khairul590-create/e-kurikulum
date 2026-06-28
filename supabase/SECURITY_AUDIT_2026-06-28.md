# Audit Keselamatan E-Kurikulum — 28 Jun 2026

Fokus: lindungi data murid daripada akses luar (hacker).

## Ringkasan
Asas dah kukuh: RLS hidup, signup tutup (`enable_signup=false`), single-admin
login, security headers (CSP/HSTS/X-Frame) ada, tiada service_role key dalam
client, tiada XSS (`dangerouslySetInnerHTML`/`eval`). Migration 0010 & 0011
dah tutup banyak lubang kritikal.

Baki lubang ditutup oleh `0013_security_hardening_v3.sql` + tindakan manual bawah.

---

## DITUTUP oleh migration 0013 (kod siap)
| ID | Isu | Risiko | Fix |
|----|-----|--------|-----|
| H-1 | `grant ... to anon` dalam 0003/0006/0009 — anon boleh baca view data murid melalui REST kalau urutan migration silap / migration lama dijalankan semula | TINGGI | Loop REVOKE anon pada SEMUA view + fungsi + jadual public (defensif, idempotent) |
| H-2 | Storage bucket `opr` policy SELECT tiada had role → anon boleh enumerate/list gambar | SEDERHANA | Hadkan SELECT `to authenticated` |
| H-3 | Ada jadual mungkin terlepas RLS | SEDERHANA | Paksa `enable row level security` semula semua jadual sensitif |

**Tindakan:** jalankan `0013_security_hardening_v3.sql` di Supabase → SQL Editor.

---

## WAJIB MANUAL (tak boleh fix dari kod)

### 1. Sahkan 0010 + 0011 + 0013 BENAR-BENAR dah dijalankan di CLOUD ⚠️
Migration ini manual (SQL Editor). Kalau belum jalan, anon **masih boleh baca
SELURUH data murid** terus melalui REST API tanpa login. Ini lubang #1.
Sahkan dengan (patut KOSONG):
```sql
select grantee, table_name, privilege_type
  from information_schema.role_table_grants
 where grantee='anon' and table_schema='public';
```

### 2. Disable public signup (sahkan di Cloud)
Dashboard → Authentication → Settings → User Signups → **OFF**.
(`config.toml` local dah `false`, tapi cloud setting berasingan.)

### 3. Tukar password admin
Dashboard → Authentication → Users → `admin@kurikulum.test` → Reset Password.
Guna password kuat (bukan `password123`). Akaun demo `guru1..40` lumpuhkan
guna `supabase/security_single_password.sql`.

### 4. Kemaskini pakej `xlsx` (vuln HIGH)
`xlsx@0.18.5` ada prototype-pollution (CVE-2023-30533) + ReDoS
(CVE-2024-22363). Dipakai masa import senarai murid (`ImportMuridDialog.tsx`)
— admin buka fail Excel jahat boleh cetus. Versi patched tiada di npm registry;
pasang dari SheetJS rasmi:
```
npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```
(API serasi ke belakang — tiada perubahan kod perlu.)

---

## PERTIMBANG (pengukuhan tambahan, bukan kritikal)
- **Bucket `opr` masih `public=true`.** getPublicUrl serve fail terus dari CDN
  tanpa auth (RLS dilangkau untuk endpoint `/public/`). Nama fail UUID rawak
  (tak boleh teka) — risiko rendah, TAPI kalau gambar program ada wajah murid,
  tukar bucket ke `private` + guna `createSignedUrl` untuk paparan.
- **`profiles_self_read using(true)`** dedah email+nama semua guru ke mana-mana
  user authenticated. Sekarang single-admin → tak terdedah. Kalau buka akaun
  guru nanti, hadkan kepada `id=auth.uid() or is_admin()`.
- **CSP `script-src 'unsafe-inline'`** — lemahkan perlindungan XSS sikit. Umum
  untuk Vite; pertimbang nonce kalau nak ketat.
- **Storage write** mana-mana authenticated boleh padam/ubah fail orang lain
  dalam bucket `opr`. Single-admin → OK. Multi-guru → skop ikut folder pemilik.

---

## Disahkan SELAMAT
- Tiada `service_role`/secret dalam `src/`, `dist/`, `vercel.json`, `vite.config.ts`.
- `.env.local` tak di-track git (dalam `.gitignore`).
- `scripts/*.cjs` guna env var, tiada kredential hardcoded.
- Anon key dalam bundle = normal (memang public by design, dilindungi RLS).
- Privilege escalation ditutup (trigger `prevent_role_escalation`, `handle_new_user` hardcode role guru).
