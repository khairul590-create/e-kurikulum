-- ============================================================
-- Ruang Fail Panitia: satu pautan folder Google Drive + carta
-- organisasi per panitia (subjek). Guru susun fail dalam Drive.
-- ============================================================

create table panitia_fail (
  subject_id uuid primary key references subjects(id) on delete cascade,
  drive_url  text,          -- pautan folder Google Drive panitia
  carta_url  text,          -- pautan imej carta organisasi
  catatan    text,
  updated_at timestamptz not null default now()
);

alter table panitia_fail enable row level security;

-- Read: semua authenticated
create policy "panitia_fail_read" on panitia_fail for select to authenticated using (true);

-- Write: admin ATAU ketua panitia subjek berkenaan
create policy "panitia_fail_write" on panitia_fail for all to authenticated
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

grant select, insert, update, delete on panitia_fail to authenticated;
