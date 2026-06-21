-- ============================================================
-- Row-Level Security
-- Admin: full akses. Guru: read semua, write hanya rekod sendiri
-- (rph, pdp_logs, assessments, assessment_scores) + tetapan profil sendiri.
-- ============================================================

create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS
alter table academic_years    enable row level security;
alter table school_settings   enable row level security;
alter table subjects          enable row level security;
alter table profiles          enable row level security;
alter table classes           enable row level security;
alter table students          enable row level security;
alter table rooms             enable row level security;
alter table rpt               enable row level security;
alter table rph               enable row level security;
alter table dskp              enable row level security;
alter table calendar_events   enable row level security;
alter table pdp_logs          enable row level security;
alter table assessments       enable row level security;
alter table assessment_scores enable row level security;
alter table sbd_plc           enable row level security;
alter table announcements     enable row level security;
alter table activities        enable row level security;
alter table kpi_targets       enable row level security;

-- ---------- Helper: read-only-untuk-semua-authenticated ----------
-- (data sekolah dikongsi semua guru)
do $$
declare t text;
begin
  foreach t in array array[
    'academic_years','subjects','classes','students','rooms','rpt','dskp',
    'calendar_events','sbd_plc','announcements','activities','kpi_targets',
    'pdp_logs','assessments','assessment_scores','rph','school_settings'
  ] loop
    execute format(
      'create policy "read_authenticated" on %I for select to authenticated using (true);', t
    );
  end loop;
end $$;

-- ---------- Admin write penuh untuk semua table pengurusan ----------
do $$
declare t text;
begin
  foreach t in array array[
    'academic_years','school_settings','subjects','classes','students','rooms',
    'rpt','dskp','calendar_events','sbd_plc','announcements','kpi_targets'
  ] loop
    execute format(
      'create policy "admin_all" on %I for all to authenticated using (is_admin()) with check (is_admin());', t
    );
  end loop;
end $$;

-- ---------- profiles ----------
create policy "profiles_self_read"   on profiles for select to authenticated using (true);
create policy "profiles_self_update" on profiles for update to authenticated
  using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());
create policy "profiles_admin_insert" on profiles for insert to authenticated with check (is_admin());
create policy "profiles_admin_delete" on profiles for delete to authenticated using (is_admin());

-- ---------- rph: guru urus sendiri, admin semua ----------
create policy "rph_write_own" on rph for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- pdp_logs ----------
create policy "pdp_write_own" on pdp_logs for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- assessments: guru cipta sendiri ----------
create policy "assessment_write_own" on assessments for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

-- ---------- assessment_scores: ikut pemilik pentaksiran ----------
create policy "scores_write_own" on assessment_scores for all to authenticated
  using (
    is_admin() or exists (
      select 1 from assessments a where a.id = assessment_id and a.guru_id = auth.uid()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from assessments a where a.id = assessment_id and a.guru_id = auth.uid()
    )
  );

-- ---------- activities: semua authenticated boleh insert (log) ----------
create policy "activities_insert" on activities for insert to authenticated with check (true);
