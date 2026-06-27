-- ============================================================
-- Laporan OPR (One Page Report) — Program / Aktiviti
-- Jadual + RLS (corak sama 0005) + bucket Storage untuk gambar.
-- ============================================================

create table if not exists opr_reports (
  id              uuid primary key default gen_random_uuid(),
  tajuk           text not null,                 -- nama program/aktiviti
  anjuran         text,                          -- unit/panitia penganjur
  tarikh_mula     date,
  tarikh_tamat    date,
  masa            text,
  tempat          text,
  sasaran         text,                          -- kumpulan sasaran
  bil_peserta     int,
  objektif        text,
  pelaksanaan     text,
  kekuatan        text,
  penambahbaikan  text,
  refleksi        text,
  kos             numeric(10,2),
  disediakan_oleh text,
  disahkan_oleh   text,
  gambar          text[] not null default '{}',  -- senarai URL awam Storage
  status          text not null default 'draf',  -- draf / selesai
  guru_id         uuid references profiles(id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_opr_guru on opr_reports(guru_id);
create index if not exists idx_opr_created on opr_reports(created_at desc);

-- ---------- RLS ----------
alter table opr_reports enable row level security;

drop policy if exists "opr_read" on opr_reports;
create policy "opr_read" on opr_reports
  for select to authenticated using (true);

drop policy if exists "opr_write_own" on opr_reports;
create policy "opr_write_own" on opr_reports
  for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- Storage bucket 'opr' (gambar) ----------
insert into storage.buckets (id, name, public)
values ('opr', 'opr', true)
on conflict (id) do nothing;

-- Policy storage.objects untuk bucket 'opr'
-- NOTA: jika "must be owner of table objects" di SQL Editor,
-- cipta policy ini melalui Dashboard -> Storage -> Policies sebaliknya.
drop policy if exists "opr_obj_read" on storage.objects;
create policy "opr_obj_read" on storage.objects
  for select using (bucket_id = 'opr');

drop policy if exists "opr_obj_insert" on storage.objects;
create policy "opr_obj_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'opr');

drop policy if exists "opr_obj_update" on storage.objects;
create policy "opr_obj_update" on storage.objects
  for update to authenticated using (bucket_id = 'opr');

drop policy if exists "opr_obj_delete" on storage.objects;
create policy "opr_obj_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'opr');
