-- ============================================================
-- Views V2: UASA, PBD (TP), Panitia, Kelas, Tahun, KSSR, RPH, Intervensi.
-- Extend v_dashboard_stats (kekal field lama supaya dashboard lama tak pecah).
-- ============================================================

-- ---------- Dashboard stats (extend) ----------
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

-- ---------- UASA: agihan gred per subjek ----------
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

-- ---------- UASA: agihan gred keseluruhan (donut) ----------
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

-- ---------- UASA: kadar lulus per subjek (gauge) ----------
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

-- ---------- UASA: murid cemerlang (purata markah) ----------
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

-- ---------- PBD: taburan TP1–TP6 ----------
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

-- ---------- PBD: purata TP per subjek ----------
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

-- ---------- Panitia: prestasi & pengurusan ----------
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

-- ---------- Kelas: prestasi keseluruhan ----------
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

-- ---------- Tahun (darjah): purata UASA & bilangan ----------
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

-- ---------- Trend GPS sekolah mengikut sesi akademik ----------
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

-- ---------- KSSR modular: kira subjek per modul ----------
create or replace view v_kssr_modular as
select
  coalesce(modul::text, 'tiada') as modul,
  count(*)                       as bilangan,
  string_agg(nama, ' · ' order by nama) as senarai
from subjects
group by modul;

-- ---------- RPH: status penghantaran per guru + rating pencerapan ----------
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

-- ---------- Intervensi: ringkasan program ----------
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

-- ---------- Grants ----------
grant select on
  v_uasa_gred_subjek, v_uasa_gred_overall, v_uasa_pass_subjek, v_uasa_cemerlang_murid,
  v_pbd_tp_taburan, v_pbd_tp_subjek, v_panitia_prestasi, v_kelas_prestasi,
  v_tahun_prestasi, v_tahun_trend_gps, v_kssr_modular, v_rph_guru_status,
  v_intervensi_ringkasan
to authenticated, anon;
