-- ==============================================================
-- E-KURIKULUM V2 — FAIL GABUNGAN (apply sekali dalam Supabase SQL Editor)
-- Urutan: 0004 (jadual) -> 0005 (RLS) -> 0006 (views) -> 0007 (fail panitia)
-- VERSI IDEMPOTENT: selamat run berulang kali (walau separa sudah dibuat).
-- ==============================================================

-- >>>>>>>>>> BAHAGIAN 1/4 : Jadual + enum (UASA, Intervensi, Pencerapan) <<<<<<<<<<

-- KSSR modular + tanda subjek UASA + pautan panitia
do $$ begin
  create type modul_kssr as enum ('teras_asas', 'teras_tema', 'elektif');
exception when duplicate_object then null; end $$;

alter table subjects add column if not exists modul   modul_kssr;
alter table subjects add column if not exists is_uasa boolean not null default false;
alter table profiles add column if not exists panitia_subject_id uuid references subjects(id) on delete set null;

-- UASA: markah % + gred A–F (Tahun 4–6)
do $$ begin
  create type uasa_gred as enum ('A', 'B', 'C', 'D', 'E', 'F');
exception when duplicate_object then null; end $$;

create table if not exists uasa_records (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  kelas_id   uuid references classes(id) on delete set null,
  tahun      int not null check (tahun between 4 and 6),
  year_id    uuid references academic_years(id),
  guru_id    uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists uasa_scores (
  id         uuid primary key default gen_random_uuid(),
  uasa_id    uuid not null references uasa_records(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  markah     numeric(5,2) not null check (markah between 0 and 100),
  gred text generated always as (
    case
      when markah >= 90 then 'A'
      when markah >= 80 then 'B'
      when markah >= 65 then 'C'
      when markah >= 50 then 'D'
      when markah >= 40 then 'E'
      else 'F'
    end
  ) stored,
  lulus boolean generated always as (markah >= 20) stored,
  created_at timestamptz not null default now(),
  unique (uasa_id, student_id)
);

-- Program Intervensi & Pemulihan
do $$ begin
  create type intervensi_status as enum ('aktif', 'selesai', 'dirancang');
exception when duplicate_object then null; end $$;

create table if not exists intervensi_programs (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  jenis      text,
  sasaran    text,
  guru_id    uuid references profiles(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  kemajuan   int not null default 0 check (kemajuan between 0 and 100),
  status     intervensi_status not null default 'dirancang',
  created_at timestamptz not null default now()
);

create table if not exists intervensi_students (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references intervensi_programs(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  unique (program_id, student_id)
);

-- Pencerapan PdP
create table if not exists pencerapan (
  id          uuid primary key default gen_random_uuid(),
  guru_id     uuid not null references profiles(id) on delete cascade,
  pencerap_id uuid references profiles(id) on delete set null,
  rph_id      uuid references rph(id) on delete set null,
  tarikh      date not null default now(),
  rating      int check (rating between 1 and 5),
  catatan     text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_uasa_scores_uasa            on uasa_scores(uasa_id);
create index if not exists idx_uasa_scores_student         on uasa_scores(student_id);
create index if not exists idx_uasa_records_subject        on uasa_records(subject_id);
create index if not exists idx_uasa_records_tahun          on uasa_records(tahun);
create index if not exists idx_uasa_records_kelas          on uasa_records(kelas_id);
create index if not exists idx_intervensi_students_program on intervensi_students(program_id);
create index if not exists idx_pencerapan_guru             on pencerapan(guru_id);


-- >>>>>>>>>> BAHAGIAN 2/4 : RLS <<<<<<<<<<

alter table uasa_records        enable row level security;
alter table uasa_scores         enable row level security;
alter table intervensi_programs enable row level security;
alter table intervensi_students enable row level security;
alter table pencerapan          enable row level security;

-- Read-only utk semua authenticated (drop dulu supaya boleh run semula)
do $$
declare t text;
begin
  foreach t in array array[
    'uasa_records','uasa_scores','intervensi_programs','intervensi_students','pencerapan'
  ] loop
    execute format('drop policy if exists "read_authenticated" on %I;', t);
    execute format('create policy "read_authenticated" on %I for select to authenticated using (true);', t);
  end loop;
end $$;

drop policy if exists "uasa_records_write_own" on uasa_records;
create policy "uasa_records_write_own" on uasa_records for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

drop policy if exists "uasa_scores_write_own" on uasa_scores;
create policy "uasa_scores_write_own" on uasa_scores for all to authenticated
  using (is_admin() or exists (select 1 from uasa_records r where r.id = uasa_id and r.guru_id = auth.uid()))
  with check (is_admin() or exists (select 1 from uasa_records r where r.id = uasa_id and r.guru_id = auth.uid()));

drop policy if exists "intervensi_write_own" on intervensi_programs;
create policy "intervensi_write_own" on intervensi_programs for all to authenticated
  using (guru_id = auth.uid() or is_admin())
  with check (guru_id = auth.uid() or is_admin());

drop policy if exists "intervensi_students_write_own" on intervensi_students;
create policy "intervensi_students_write_own" on intervensi_students for all to authenticated
  using (is_admin() or exists (select 1 from intervensi_programs p where p.id = program_id and p.guru_id = auth.uid()))
  with check (is_admin() or exists (select 1 from intervensi_programs p where p.id = program_id and p.guru_id = auth.uid()));

drop policy if exists "pencerapan_write_own" on pencerapan;
create policy "pencerapan_write_own" on pencerapan for all to authenticated
  using (pencerap_id = auth.uid() or is_admin())
  with check (pencerap_id = auth.uid() or is_admin());


-- >>>>>>>>>> BAHAGIAN 3/4 : Views <<<<<<<<<<

create or replace view v_dashboard_stats as
select
  (select count(*) from subjects)                              as jum_subjek,
  (select count(*) from profiles where status = 'aktif' and role = 'guru') as jum_guru,
  (select count(*) from students where status = 'aktif')       as jum_murid,
  coalesce((select round(100.0 * count(*) filter (where status = 'selesai') / nullif(count(*),0))
            from rph), 0)                                       as peratus_rph,
  coalesce((select round(avg(markah)) from assessment_scores), 0) as purata_pencapaian,
  (select count(*) from classes)                               as jum_kelas,
  coalesce((select round(avg(markah), 1) from uasa_scores), 0) as purata_uasa,
  coalesce((select round(100.0 * count(*) filter (where lulus) / nullif(count(*),0), 1)
            from uasa_scores), 0)                               as peratus_lulus_uasa,
  coalesce((select round(avg(tp_level), 2) from assessment_scores where tp_level is not null), 0)
                                                                as purata_tp;

create or replace view v_uasa_gred_subjek as
select
  s.id                                       as subject_id,
  s.nama                                     as subjek,
  s.warna                                    as warna,
  count(sc.*)                                as jumlah,
  count(*) filter (where sc.gred = 'A')      as gred_a,
  count(*) filter (where sc.gred = 'B')      as gred_b,
  count(*) filter (where sc.gred = 'C')      as gred_c,
  count(*) filter (where sc.gred = 'D')      as gred_d,
  count(*) filter (where sc.gred = 'E')      as gred_e,
  count(*) filter (where sc.gred = 'F')      as gred_f,
  coalesce(round(avg(sc.markah), 1), 0)      as purata
from subjects s
join uasa_records r  on r.subject_id = s.id
join uasa_scores  sc on sc.uasa_id = r.id
group by s.id, s.nama, s.warna
order by purata desc;

create or replace view v_uasa_gred_overall as
with d as (
  select gred, count(*) c from uasa_scores group by gred
), tot as ( select sum(c) t from d )
select
  d.gred,
  d.c                                            as bilangan,
  coalesce(round(100.0 * d.c / nullif(tot.t,0)), 0) as peratus
from d, tot
order by array_position(array['A','B','C','D','E','F']::text[], d.gred);

create or replace view v_uasa_pass_subjek as
select
  s.id                                       as subject_id,
  s.nama                                     as subjek,
  count(sc.*)                                as jumlah,
  coalesce(round(100.0 * count(*) filter (where sc.lulus) / nullif(count(sc.*),0), 1), 0) as peratus_lulus
from subjects s
join uasa_records r  on r.subject_id = s.id
join uasa_scores  sc on sc.uasa_id = r.id
group by s.id, s.nama
order by peratus_lulus desc;

create or replace view v_uasa_cemerlang_murid as
select
  st.id              as student_id,
  st.nama            as nama,
  k.nama             as kelas,
  k.tahun            as tahun,
  count(sc.*)        as bil_subjek,
  round(avg(sc.markah), 1) as purata,
  min(sc.gred)       as gred_terendah
from students st
join uasa_scores sc on sc.student_id = st.id
left join classes k on k.id = st.kelas_id
group by st.id, st.nama, k.nama, k.tahun
order by purata desc;

create or replace view v_pbd_tp_taburan as
with d as (
  select tp_level, count(*) c from assessment_scores where tp_level is not null group by tp_level
), tot as ( select sum(c) t from d )
select
  d.tp_level                                     as tp,
  d.c                                            as bilangan,
  coalesce(round(100.0 * d.c / nullif(tot.t,0)), 0) as peratus
from d, tot
order by d.tp_level;

create or replace view v_pbd_tp_subjek as
select
  s.id                                  as subject_id,
  s.nama                                as subjek,
  s.warna                               as warna,
  count(sc.*) filter (where sc.tp_level = 1) as tp1,
  count(sc.*) filter (where sc.tp_level = 2) as tp2,
  count(sc.*) filter (where sc.tp_level = 3) as tp3,
  count(sc.*) filter (where sc.tp_level = 4) as tp4,
  count(sc.*) filter (where sc.tp_level = 5) as tp5,
  count(sc.*) filter (where sc.tp_level = 6) as tp6,
  coalesce(round(avg(sc.tp_level), 1), 0) as tp_purata
from subjects s
join assessments a   on a.subject_id = s.id
join assessment_scores sc on sc.assessment_id = a.id and sc.tp_level is not null
group by s.id, s.nama, s.warna
order by tp_purata desc;

create or replace view v_panitia_prestasi as
select
  s.id    as subject_id,
  s.nama  as subjek,
  s.warna as warna,
  s.modul as modul,
  (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_ketua_panitia limit 1) as ketua,
  (select count(*) from profiles p where p.panitia_subject_id = s.id) as bil_guru,
  coalesce(round(
    (select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
     where r.subject_id = s.id), 1), 0) as purata_uasa,
  coalesce(round(
    (select avg(asc2.tp_level) from assessments a join assessment_scores asc2 on asc2.assessment_id = a.id
     where a.subject_id = s.id and asc2.tp_level is not null), 1), 0) as purata_tp,
  case
    when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
                   where r.subject_id = s.id), 0) >= 74 then 'Cemerlang'
    when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
                   where r.subject_id = s.id), 0) >= 70 then 'Baik'
    else 'Perlu Fokus'
  end as status
from subjects s
order by purata_uasa desc;

create or replace view v_kelas_prestasi as
select
  k.id    as kelas_id,
  k.nama  as kelas,
  k.tahun as tahun,
  (select count(*) from students st where st.kelas_id = k.id and st.status = 'aktif') as bil_murid,
  coalesce(round(
    (select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
     where r.kelas_id = k.id), 1), 0) as purata_uasa,
  coalesce(round(
    (select avg(asc2.tp_level) from assessments a join assessment_scores asc2 on asc2.assessment_id = a.id
     where a.kelas_id = k.id and asc2.tp_level is not null), 1), 0) as purata_tp,
  coalesce(round(
    (select 100.0 * count(*) filter (where sc.lulus) / nullif(count(sc.*),0)
     from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
     where r.kelas_id = k.id), 0), 0) as peratus_lulus,
  case
    when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
                   where r.kelas_id = k.id), 0) >= 74 then 'Cemerlang'
    when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
                   where r.kelas_id = k.id), 0) >= 68 then 'Baik'
    else 'Sederhana'
  end as status
from classes k
order by k.tahun desc, k.nama;

create or replace view v_tahun_prestasi as
select
  k.tahun                                      as tahun,
  count(distinct k.id)                         as bil_kelas,
  (select count(*) from students st join classes c on c.id = st.kelas_id
   where c.tahun = k.tahun and st.status = 'aktif') as bil_murid,
  coalesce(round(
    (select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id = r.id
     where r.tahun = k.tahun), 1), 0)          as purata_uasa
from classes k
group by k.tahun
order by k.tahun desc;

create or replace view v_tahun_trend_gps as
select
  ay.label                                     as sesi,
  ay.is_current                                as semasa,
  coalesce(round(avg(sc.markah), 1), 0)        as purata
from academic_years ay
left join uasa_records r on r.year_id = ay.id
left join uasa_scores  sc on sc.uasa_id = r.id
group by ay.id, ay.label, ay.is_current
order by ay.label;

create or replace view v_kssr_modular as
select
  coalesce(modul::text, 'tiada') as modul,
  count(*)                       as bilangan,
  string_agg(nama, ' · ' order by nama) as senarai
from subjects
group by modul;

create or replace view v_rph_guru_status as
select
  p.id                                         as guru_id,
  p.nama                                       as guru,
  sub.nama                                     as subjek,
  count(r.*)                                   as jum_rph,
  count(r.*) filter (where r.status = 'selesai') as rph_selesai,
  coalesce(round(100.0 * count(r.*) filter (where r.status = 'selesai')
           / nullif(count(r.*),0)), 0)         as peratus_selesai,
  (select round(avg(pc.rating), 1) from pencerapan pc where pc.guru_id = p.id) as rating_pencerapan
from profiles p
left join rph r   on r.guru_id = p.id
left join subjects sub on sub.id = p.panitia_subject_id
where p.role = 'guru'
group by p.id, p.nama, sub.nama
order by p.nama;

create or replace view v_intervensi_ringkasan as
select
  ip.id,
  ip.nama,
  ip.jenis,
  ip.sasaran,
  ip.kemajuan,
  ip.status,
  p.nama  as guru,
  s.nama  as subjek,
  (select count(*) from intervensi_students ist where ist.program_id = ip.id) as bil_murid
from intervensi_programs ip
left join profiles p on p.id = ip.guru_id
left join subjects s on s.id = ip.subject_id
order by ip.created_at desc;

grant select on
  v_uasa_gred_subjek, v_uasa_gred_overall, v_uasa_pass_subjek, v_uasa_cemerlang_murid,
  v_pbd_tp_taburan, v_pbd_tp_subjek, v_panitia_prestasi, v_kelas_prestasi,
  v_tahun_prestasi, v_tahun_trend_gps, v_kssr_modular, v_rph_guru_status,
  v_intervensi_ringkasan
to authenticated, anon;


-- >>>>>>>>>> BAHAGIAN 4/4 : Ruang Fail Panitia <<<<<<<<<<

create table if not exists panitia_fail (
  subject_id uuid primary key references subjects(id) on delete cascade,
  drive_url  text,
  carta_url  text,
  catatan    text,
  updated_at timestamptz not null default now()
);

alter table panitia_fail enable row level security;

drop policy if exists "panitia_fail_read" on panitia_fail;
create policy "panitia_fail_read" on panitia_fail for select to authenticated using (true);

drop policy if exists "panitia_fail_write" on panitia_fail;
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
