-- ============================================================
-- 0014_jadual_waktu.sql
-- Jadual Waktu Guru — slot mengajar (guru × hari × masa × kelas × subjek × bilik).
-- PK1 lihat grid; admin urus (CRUD). Corak RLS sama 0002 + defensif 0013.
-- Jalankan di: Supabase → SQL Editor. Selamat dijalankan berulang.
-- ============================================================

create table if not exists jadual_waktu (
  id          uuid primary key default gen_random_uuid(),
  guru_id     uuid not null references profiles(id) on delete cascade,
  hari        smallint not null check (hari between 1 and 7),  -- 1=Isnin .. 5=Jumaat
  masa_mula   time not null,
  masa_akhir  time not null,
  kelas_id    uuid references classes(id) on delete set null,
  subject_id  uuid references subjects(id) on delete set null,
  bilik       text,                                            -- bebas (bilik darjah biasa tiada dlm 'rooms')
  sesi        text not null default 'pagi',                    -- pagi / petang
  year_id     uuid references academic_years(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_jadual_guru on jadual_waktu(guru_id);
create index if not exists idx_jadual_hari on jadual_waktu(hari, masa_mula);

-- elak slot bertindih untuk guru sama (year null dianggap nilai tetap)
create unique index if not exists uq_jadual_slot
  on jadual_waktu(
    guru_id, hari, masa_mula, sesi,
    coalesce(year_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- ---------- RLS ----------
alter table jadual_waktu enable row level security;
revoke all on jadual_waktu from anon;

drop policy if exists "jadual_read" on jadual_waktu;
create policy "jadual_read" on jadual_waktu
  for select to authenticated using (true);

drop policy if exists "jadual_admin_all" on jadual_waktu;
create policy "jadual_admin_all" on jadual_waktu
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- Sahkan (patut KOSONG):
-- select grantee from information_schema.role_table_grants
--   where table_name='jadual_waktu' and grantee='anon';
