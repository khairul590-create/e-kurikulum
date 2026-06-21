-- ============================================================
-- Views agregat untuk Dashboard & Analisis
-- ============================================================

-- Statistik utama (kad atas)
create or replace view v_dashboard_stats as
select
  (select count(*) from subjects)                              as jum_subjek,
  (select count(*) from profiles where status = 'aktif' and role = 'guru') as jum_guru,
  (select count(*) from students where status = 'aktif')       as jum_murid,
  coalesce((select round(100.0 * count(*) filter (where status = 'selesai') / nullif(count(*),0))
            from rph), 0)                                       as peratus_rph,
  coalesce((select round(avg(markah)) from assessment_scores), 0) as purata_pencapaian,
  (select count(*) from classes)                               as jum_kelas;

-- Taburan tahap pencapaian murid
create or replace view v_pencapaian_taburan as
with d as (
  select tahap, count(*) c from assessment_scores where tahap is not null group by tahap
), tot as ( select sum(c) t from d )
select
  d.tahap,
  d.c                                            as bilangan,
  coalesce(round(100.0 * d.c / nullif(tot.t,0)), 0) as peratus
from d, tot
order by array_position(
  array['cemerlang','baik','memuaskan','perlu_bimbingan']::tahap_pencapaian[], d.tahap
);

-- Status pelaksanaan RPH
create or replace view v_rph_status as
with d as ( select status, count(*) c from rph group by status ),
tot as ( select sum(c) t from d )
select
  d.status,
  d.c                                            as bilangan,
  coalesce(round(100.0 * d.c / nullif(tot.t,0)), 0) as peratus
from d, tot;

-- RPH mengikut mata pelajaran (% selesai)
create or replace view v_rph_per_subject as
select
  s.id           as subject_id,
  s.nama         as subjek,
  s.warna        as warna,
  count(r.*)     as jumlah,
  coalesce(round(100.0 * count(r.*) filter (where r.status = 'selesai')
           / nullif(count(r.*),0)), 0) as peratus_selesai
from subjects s
left join rph r on r.subject_id = s.id
group by s.id, s.nama, s.warna
order by peratus_selesai desc;

-- Trend pencapaian purata mengikut bulan
create or replace view v_trend_pencapaian as
select
  to_char(a.tarikh, 'Mon')                       as bulan,
  extract(month from a.tarikh)::int              as bulan_no,
  coalesce(round(avg(sc.markah)), 0)             as purata
from assessments a
join assessment_scores sc on sc.assessment_id = a.id
group by 1, 2
order by 2;

-- Ringkasan pentaksiran (kad)
create or replace view v_pentaksiran_ringkasan as
select
  (select count(*) from assessment_scores sc
     join assessments a on a.id = sc.assessment_id where a.jenis = 'formatif') as formatif,
  (select count(*) from assessment_scores sc
     join assessments a on a.id = sc.assessment_id where a.jenis = 'sumatif')  as sumatif,
  coalesce((select round(100.0 * count(*) filter (where tp_level >= 4) / nullif(count(*),0))
            from assessment_scores where tp_level is not null), 0)             as peratus_tp4_atas;

grant select on
  v_dashboard_stats, v_pencapaian_taburan, v_rph_status, v_rph_per_subject,
  v_trend_pencapaian, v_pentaksiran_ringkasan
to authenticated, anon;
