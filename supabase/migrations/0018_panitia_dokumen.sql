-- ============================================================
-- Dokumen Panitia: senarai berbilang pautan Google Drive berkategori
-- (Minit Mesyuarat / RPT & RPH / Am) — lengkapkan panitia_fail yang
-- cuma simpan 1 folder utama + 1 carta organisasi.
-- ============================================================

create type panitia_dokumen_jenis as enum ('minit_mesyuarat', 'rpt_rph', 'am');

create table panitia_dokumen (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references subjects(id) on delete cascade,
  jenis       panitia_dokumen_jenis not null default 'am',
  nama        text not null,
  drive_url   text not null,
  catatan     text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table panitia_dokumen enable row level security;

-- Read: semua authenticated
create policy "panitia_dokumen_read" on panitia_dokumen for select to authenticated using (true);

-- Write: admin ATAU guru yang di-assign ke panitia subjek berkenaan
-- (sama corak kebenaran macam panitia_fail — tiada sekatan ketua/setiausaha khas).
create policy "panitia_dokumen_write" on panitia_dokumen for all to authenticated
  using (
    is_admin() or exists (
      select 1 from profiles p where p.id = auth.uid() and p.panitia_subject_id = subject_id
    )
  )
  with check (
    is_admin() or exists (
      select 1 from profiles p where p.id = auth.uid() and p.panitia_subject_id = subject_id
    )
  );

grant select, insert, update, delete on panitia_dokumen to authenticated;
