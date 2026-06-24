-- =============================================================
-- 0010_security_hardening.sql
-- Ketatkan keselamatan: buang akses anon ke fungsi analytics
-- + tukar kata laluan admin
-- Jalankan di: Supabase → SQL Editor
-- =============================================================

-- ── 1. Tarik balik kebenaran anon pada 8 fungsi analytics ──
-- (sebelum ini: GRANT TO authenticated, anon — anon boleh baca data murid tanpa log masuk)

REVOKE EXECUTE ON FUNCTION fn_uasa_gred_overall(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_uasa_gred_subjek(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_uasa_pass_subjek(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_uasa_cemerlang(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_dashboard_uasa(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_panitia_prestasi(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_kelas_prestasi(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION fn_tahun_prestasi(uuid) FROM anon;

-- Sahkan: hanya authenticated boleh guna fungsi ini
GRANT EXECUTE ON FUNCTION fn_uasa_gred_overall(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_uasa_gred_subjek(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_uasa_pass_subjek(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_uasa_cemerlang(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_dashboard_uasa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_panitia_prestasi(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_kelas_prestasi(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_tahun_prestasi(uuid) TO authenticated;


-- ── 2. Tukar kata laluan akaun admin ──
-- Kata laluan baru: kuri@skdarau2026

UPDATE auth.users
SET encrypted_password = crypt('kuri@skdarau2026', gen_salt('bf'))
WHERE email = 'admin@kurikulum.test';


-- ── 3. Pastikan activities hanya boleh INSERT oleh authenticated ──
-- (bukan anon — elak pemalsuan log)

DROP POLICY IF EXISTS "activities_insert" ON activities;
CREATE POLICY "activities_insert" ON activities
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "activities_select" ON activities;
CREATE POLICY "activities_select" ON activities
  FOR SELECT TO authenticated USING (true);


-- ── 4. Pastikan school_settings hanya boleh SELECT oleh authenticated ──
-- (sidebar papar nama sekolah — hanya perlu selepas log masuk)

DROP POLICY IF EXISTS "school_settings_read" ON school_settings;
CREATE POLICY "school_settings_read" ON school_settings
  FOR SELECT TO authenticated USING (true);


-- Selesai. Semua data murid & analitik kini hanya boleh diakses selepas log masuk.
