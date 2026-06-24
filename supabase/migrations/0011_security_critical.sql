-- =============================================================
-- 0011_security_critical.sql
-- Fix 8 isu KRITIKAL + 5 isu TINGGI daripada audit keselamatan
-- Jalankan di: Supabase → SQL Editor
-- =============================================================


-- ═══════════════════════════════════════════════════════════
-- C-1: CABUT akses anon pada SEMUA views analitik
-- (anon boleh baca data murid terus melalui REST API)
-- ═══════════════════════════════════════════════════════════

REVOKE SELECT ON
  v_dashboard_stats,
  v_pencapaian_taburan,
  v_rph_status,
  v_rph_per_subject,
  v_trend_pencapaian,
  v_pentaksiran_ringkasan,
  v_uasa_gred_subjek,
  v_uasa_gred_overall,
  v_uasa_pass_subjek,
  v_uasa_cemerlang_murid,
  v_pbd_tp_taburan,
  v_pbd_tp_subjek,
  v_panitia_prestasi,
  v_kelas_prestasi,
  v_tahun_prestasi,
  v_kssr_modular,
  v_rph_guru_status,
  v_intervensi_ringkasan
FROM anon;

-- Sahkan grants (sepatutnya sudah ada dari migration asal)
GRANT SELECT ON
  v_dashboard_stats, v_pencapaian_taburan, v_rph_status, v_rph_per_subject,
  v_trend_pencapaian, v_pentaksiran_ringkasan, v_uasa_gred_subjek,
  v_uasa_gred_overall, v_uasa_pass_subjek, v_uasa_cemerlang_murid,
  v_pbd_tp_taburan, v_pbd_tp_subjek, v_panitia_prestasi, v_kelas_prestasi,
  v_tahun_prestasi, v_kssr_modular, v_rph_guru_status, v_intervensi_ringkasan
TO authenticated;

-- C-2: Sahkan cabut anon dari fn_* (sudah dalam 0010, ulang untuk pastikan)
REVOKE EXECUTE ON FUNCTION
  fn_uasa_gred_overall(uuid), fn_uasa_gred_subjek(uuid),
  fn_uasa_pass_subjek(uuid), fn_uasa_cemerlang(uuid),
  fn_dashboard_uasa(uuid), fn_panitia_prestasi(uuid),
  fn_kelas_prestasi(uuid), fn_tahun_prestasi(uuid)
FROM anon;


-- ═══════════════════════════════════════════════════════════
-- C-4: HALANG privilege escalation — guru tetap role='admin' sendiri
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Hanya admin boleh tukar role
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Dilarang: hanya admin boleh mengubah role pengguna';
  END IF;
  -- Hanya admin boleh tukar is_ketua_panitia
  IF NEW.is_ketua_panitia IS DISTINCT FROM OLD.is_ketua_panitia AND NOT is_admin() THEN
    RAISE EXCEPTION 'Dilarang: hanya admin boleh mengubah is_ketua_panitia';
  END IF;
  -- Hanya admin boleh tukar status
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT is_admin() THEN
    RAISE EXCEPTION 'Dilarang: hanya admin boleh mengubah status pengguna';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();


-- ═══════════════════════════════════════════════════════════
-- C-5: FIX handle_new_user() — jangan biar client tentukan role
-- Hardcode 'guru' — admin promote selepas itu melalui Dashboard
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, role, status)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    'guru'::user_role,  -- SENTIASA guru; jangan ambil dari metadata
    'aktif'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;


-- ═══════════════════════════════════════════════════════════
-- H-2: FIX activities INSERT — actor_id mesti auth.uid()
-- Halang pemalsuan log dengan nama orang lain
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "activities_insert" ON activities;
DROP POLICY IF EXISTS activities_insert ON activities;

CREATE POLICY activities_insert ON activities
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- Trigger: auto-set actor_id kepada auth.uid() supaya log tidak boleh dipalsukan
CREATE OR REPLACE FUNCTION set_activity_actor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.actor_id := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_activity_actor ON activities;
CREATE TRIGGER trg_set_activity_actor
  BEFORE INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION set_activity_actor();


-- ═══════════════════════════════════════════════════════════
-- H-3: FIX activities SELECT — hanya admin boleh baca log
-- (sebelum ini semua guru authenticated boleh baca log)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "activities_select" ON activities;
DROP POLICY IF EXISTS activities_select ON activities;

CREATE POLICY activities_select_admin ON activities
  FOR SELECT TO authenticated
  USING (is_admin());

-- Admin juga boleh DELETE log lama (housekeeping)
DROP POLICY IF EXISTS activities_admin_all ON activities;
CREATE POLICY activities_admin_manage ON activities
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());


-- ═══════════════════════════════════════════════════════════
-- H-6 (sudah dalam arahan manual): Disable public signup
-- Lakukan di: Supabase Dashboard → Authentication → Settings → User Signups → OFF
-- ═══════════════════════════════════════════════════════════
-- (Tidak boleh dilakukan melalui SQL — perlu Dashboard)


-- ═══════════════════════════════════════════════════════════
-- C-3: Tukar kata laluan admin
-- JANGAN simpan plaintext dalam SQL — gunakan Supabase Dashboard:
-- Authentication → Users → admin@kurikulum.test → Reset Password
-- ═══════════════════════════════════════════════════════════
-- (Tidak dilakukan di sini kerana kata laluan tidak patut disimpan dalam git)


-- Selesai. Semak dengan:
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'anon' AND table_name LIKE 'v_%';
-- Mesti kosong (tiada baris).
