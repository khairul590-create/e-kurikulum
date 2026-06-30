-- ============================================================
-- 0016_guru_standalone.sql
-- Benarkan admin tambah NAMA GURU tanpa akaun login.
-- Sistem ini single-admin (guru tak log masuk) — guru hanya perlu wujud
-- sebagai data untuk dropdown (jadual, RPH, panitia, kelas, dll).
--
-- Sebelum ini: profiles.id REFERENCES auth.users(id) → mesti ada akaun auth,
-- dan id tiada default → INSERT guru baharu gagal.
--
-- Selepas ini: profiles boleh berdiri sendiri (id auto-jana). Guru sedia ada
-- yang ADA akaun (cth admin) kekal berfungsi — id mereka tak berubah.
-- Jalankan di: Supabase → SQL Editor. Idempotent.
-- ============================================================

-- 1. Buang FK profiles.id → auth.users (cari nama constraint automatik)
do $$
declare c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'f'
    and confrelid = 'auth.users'::regclass;
  if c is not null then
    execute format('alter table public.profiles drop constraint %I', c);
  end if;
end $$;

-- 2. Beri id default supaya INSERT tanpa id berjaya
alter table public.profiles alter column id set default gen_random_uuid();

-- Nota: handle_new_user() (trigger signup) masih berfungsi — ia hantar id sendiri.
-- Kesan: padam akaun auth tak lagi auto-padam profil (OK untuk single-admin).

-- 3. Sahkan:
-- select column_default from information_schema.columns
--   where table_name='profiles' and column_name='id';   -- patut gen_random_uuid()
