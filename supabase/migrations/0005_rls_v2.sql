-- ============================================================
-- RLS untuk jadual V2 (UASA, Intervensi, Pencerapan).
-- Corak sama 0002: read semua authenticated, write admin / pemilik.
-- ============================================================

alter table uasa_records       enable row level security;
alter table uasa_scores        enable row level security;
alter table intervensi_programs enable row level security;
alter table intervensi_students enable row level security;
alter table pencerapan         enable row level security;

-- ---------- Read-only untuk semua authenticated ----------
do $$
declare t text;
begin
  foreach t in array array[
    'uasa_records','uasa_scores','intervensi_programs','intervensi_students','pencerapan'
  ] loop
    execute format(
      'create policy "read_authenticated" on %I for select to authenticated using (true);', t
    );
  end loop;
end $$;

-- ---------- uasa_records: guru urus sendiri, admin semua ----------
create policy "uasa_records_write_own" on uasa_records for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- uasa_scores: ikut pemilik rekod UASA ----------
create policy "uasa_scores_write_own" on uasa_scores for all to authenticated
  using (
    is_admin() or exists (
      select 1 from uasa_records r where r.id = uasa_id and r.guru_id = auth.uid()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from uasa_records r where r.id = uasa_id and r.guru_id = auth.uid()
    )
  );

-- ---------- intervensi_programs: guru pengelola sendiri, admin semua ----------
create policy "intervensi_write_own" on intervensi_programs for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- intervensi_students: ikut pemilik program ----------
create policy "intervensi_students_write_own" on intervensi_students for all to authenticated
  using (
    is_admin() or exists (
      select 1 from intervensi_programs p where p.id = program_id and p.guru_id = auth.uid()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from intervensi_programs p where p.id = program_id and p.guru_id = auth.uid()
    )
  );

-- ---------- pencerapan: pencerap urus sendiri, admin semua ----------
create policy "pencerapan_write_own" on pencerapan for all to authenticated
  using (pencerap_id = auth.uid() or is_admin())
  with check (pencerap_id = auth.uid() or is_admin());
