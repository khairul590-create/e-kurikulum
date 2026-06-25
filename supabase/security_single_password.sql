-- ============================================================
-- E-Kurikulum — Kunci sistem kepada SATU password (akaun admin)
-- ------------------------------------------------------------
-- Tujuan: hanya admin@kurikulum.test boleh login. Semua akaun
-- demo lain (cikgu.ahmad, guru1..guru40) dilumpuhkan supaya
-- 'password123' tidak boleh lagi guna untuk login terus ke API.
--
-- Jalankan di: Supabase Dashboard → SQL Editor (CLOUD)
--             atau  psql / supabase db (LOCAL)
-- Selamat dijalankan berulang (idempotent).
-- ============================================================

-- ── 1. (CLOUD) TUKAR PASSWORD ADMIN ─────────────────────────
-- Cara disyorkan: tukar lewat Dashboard → Authentication → Users.
-- Kalau nak guna SQL, buang komen baris bawah & ganti password:
--
-- update auth.users
--   set encrypted_password = crypt('PASSWORD_BARU_ANDA', gen_salt('bf'))
--   where email = 'admin@kurikulum.test';


-- ── 2. LUMPUH SEMUA AKAUN BUKAN-ADMIN (SELAMAT, data kekal) ──
-- Tukar password mereka jadi rawak → 'password123' mati.
-- Tiada data dipadam. Inilah pilihan default & disyorkan.
update auth.users
  set encrypted_password = crypt(gen_random_uuid()::text, gen_salt('bf'))
  where email <> 'admin@kurikulum.test'
    and email like '%@kurikulum.test';


-- ── 3. (PILIHAN) PADAM TERUS akaun demo ─────────────────────
-- ⚠️ BAHAYA: cascade akan PADAM data milik akaun tu juga
--    (rph, assessments, pencerapan = on delete cascade).
--    Guna HANYA kalau pasti semua data masih data demo seed.
--    Buang komen blok ini untuk aktifkan:
--
-- delete from auth.users
--   where email <> 'admin@kurikulum.test'
--     and email like '%@kurikulum.test';


-- ── 4. SAHKAN ───────────────────────────────────────────────
-- Patut tinggal 1 baris sahaja (admin) yang boleh login.
select email,
       (raw_user_meta_data->>'role') as role,
       created_at
  from auth.users
  order by email;
