-- =============================================================
-- 0013_security_hardening_v3.sql
-- Penutup lubang keselamatan menyeluruh (defensif + idempotent).
-- Jalankan di: Supabase → SQL Editor (CLOUD) selepas semua migration lain.
-- Selamat dijalankan berulang.
--
-- Tujuan:
--   1. CABUT semua akses 'anon' pada SEMUA view + fungsi di skema public
--      (migration lama 0003/0006/0009 ada `grant ... to anon` — ini pastikan
--       tiada data murid bocor ke REST API tanpa log masuk, walau urutan
--       migration tersilap atau ada migration lama dijalankan semula).
--   2. Ketatkan policy Storage bucket 'opr' — halang anon enumerate fail.
--   3. Sahkan RLS hidup pada semua jadual sensitif.
-- =============================================================


-- ═══════════════════════════════════════════════════════════
-- 1. CABUT anon pada SEMUA view dalam skema public
-- ═══════════════════════════════════════════════════════════
do $$
declare r record;
begin
  for r in
    select table_name
    from information_schema.views
    where table_schema = 'public'
  loop
    execute format('revoke all on public.%I from anon;', r.table_name);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════
-- 2. CABUT anon pada SEMUA fungsi dalam skema public
--    (fn_* analytics + helper). EXECUTE kekal untuk authenticated.
-- ═══════════════════════════════════════════════════════════
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('revoke all on function %s from anon;', r.sig);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════
-- 3. CABUT anon pada SEMUA jadual dalam skema public
--    (anon tak patut SELECT/INSERT apa-apa terus)
-- ═══════════════════════════════════════════════════════════
do $$
declare r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('revoke all on public.%I from anon;', r.tablename);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════
-- 4. Ketatkan Storage bucket 'opr'
--    SELECT: hanya authenticated (halang anon list/enumerate fail).
--    Nota: bucket masih public=true supaya getPublicUrl berfungsi untuk
--    paparan cetakan OPR. Fail dinamakan crypto.randomUUID (tak boleh teka).
--    Untuk perlindungan PENUH gambar yang mungkin ada wajah murid,
--    pertimbang tukar bucket ke private + signed URL (lihat laporan).
-- ═══════════════════════════════════════════════════════════
drop policy if exists "opr_obj_read" on storage.objects;
create policy "opr_obj_read" on storage.objects
  for select to authenticated using (bucket_id = 'opr');

drop policy if exists "opr_obj_insert" on storage.objects;
create policy "opr_obj_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'opr');

drop policy if exists "opr_obj_update" on storage.objects;
create policy "opr_obj_update" on storage.objects
  for update to authenticated using (bucket_id = 'opr');

drop policy if exists "opr_obj_delete" on storage.objects;
create policy "opr_obj_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'opr');


-- ═══════════════════════════════════════════════════════════
-- 5. SAHKAN RLS hidup pada semua jadual sensitif
--    (paksa hidupkan semula jika ada yang terlepas)
-- ═══════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'academic_years','school_settings','subjects','profiles','classes',
    'students','rooms','rpt','rph','dskp','calendar_events','pdp_logs',
    'assessments','assessment_scores','sbd_plc','announcements','activities',
    'kpi_targets','uasa_records','uasa_scores','intervensi_programs',
    'intervensi_students','pencerapan','opr_reports'
  ] loop
    if exists (select 1 from pg_tables where schemaname='public' and tablename=t) then
      execute format('alter table public.%I enable row level security;', t);
    end if;
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════
-- 6. SAHKAN — patut KOSONG (tiada baris)
-- ═══════════════════════════════════════════════════════════
-- select grantee, table_schema, table_name, privilege_type
--   from information_schema.role_table_grants
--  where grantee = 'anon' and table_schema = 'public';
--
-- select grantee, routine_name
--   from information_schema.role_routine_grants
--  where grantee = 'anon' and routine_schema = 'public';

-- Selesai.
