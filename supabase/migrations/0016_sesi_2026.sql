-- ============================================================
-- 0016_sesi_2026.sql
-- Tambah sesi akademik 2026 sebagai SESI SEMASA.
-- Data sesi lama (2024/2025) KEKAL betul — tiada rename, sejarah bersih.
-- Jalankan di: Supabase → SQL Editor. Selamat dijalankan berulang (idempotent).
-- ============================================================

-- 1. Matikan sesi semasa yang lama
update academic_years set is_current = false where is_current = true;

-- 2. Tambah / aktifkan sesi 2026 sebagai semasa
insert into academic_years (label, is_current)
values ('2026', true)
on conflict (label) do update set is_current = true;

-- 3. Selaraskan medan teks tahun_semasa pada tetapan sekolah
update school_settings set tahun_semasa = '2026' where id = 1;

-- 4. Sahkan — patut '2026' is_current = true, sesi lain false
-- select label, is_current from academic_years order by label;
