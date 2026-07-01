-- ============================================================
-- Setiausaha Panitia: jawatan khusus-panitia (selari is_ketua_panitia)
-- + papar nama Setiausaha dalam view/fungsi prestasi panitia.
-- ============================================================

alter table profiles add column if not exists is_setiausaha_panitia boolean not null default false;

-- ---------- v_panitia_prestasi: tambah lajur setiausaha ----------
create or replace view v_panitia_prestasi as
select
  s.id    as subject_id,
  s.nama  as subjek,
  s.warna as warna,
  s.modul as modul,
  (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_ketua_panitia limit 1) as ketua,
  (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_setiausaha_panitia limit 1) as setiausaha,
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

-- ---------- fn_panitia_prestasi: tambah setiausaha (anjak purata_uasa ke posisi 8) ----------
create or replace function fn_panitia_prestasi(p_year uuid default null)
returns table(subject_id uuid, subjek text, warna text, modul text, ketua text, setiausaha text,
              bil_guru bigint, purata_uasa numeric, purata_tp numeric, status text)
language sql stable as $$
  select s.id, s.nama, s.warna, s.modul::text,
    (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_ketua_panitia limit 1),
    (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_setiausaha_panitia limit 1),
    (select count(*) from profiles p where p.panitia_subject_id = s.id),
    coalesce(round((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
       where r.subject_id=s.id and (p_year is null or r.year_id=p_year)),1),0),
    coalesce(round((select avg(a2.tp_level) from assessments a join assessment_scores a2 on a2.assessment_id=a.id
       where a.subject_id=s.id and a2.tp_level is not null),1),0),
    case
      when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
        where r.subject_id=s.id and (p_year is null or r.year_id=p_year)),0) >= 74 then 'Cemerlang'
      when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
        where r.subject_id=s.id and (p_year is null or r.year_id=p_year)),0) >= 70 then 'Baik'
      else 'Perlu Fokus'
    end
  from subjects s
  order by 8 desc;
$$;
