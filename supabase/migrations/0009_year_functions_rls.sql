-- ============================================================
-- Tapisan SESI (year_id) utk analitik UASA + ketatkan RLS markah UASA.
-- View tak boleh terima param → guna SQL function (p_year uuid; null = semua sesi).
-- Hanya UASA ada year_id; PBD/assessment tiada → kekal kumulatif.
-- ============================================================

-- ---------- Fungsi UASA ber-parameter sesi ----------
create or replace function fn_uasa_gred_overall(p_year uuid default null)
returns table(gred text, bilangan bigint, peratus numeric)
language sql stable as $$
  with d as (
    select sc.gred, count(*) c
    from uasa_scores sc join uasa_records r on r.id = sc.uasa_id
    where (p_year is null or r.year_id = p_year)
    group by sc.gred
  ), tot as (select sum(c) t from d)
  select d.gred, d.c, coalesce(round(100.0 * d.c / nullif(tot.t,0)), 0)
  from d, tot
  order by array_position(array['A','B','C','D','E','F']::text[], d.gred);
$$;

create or replace function fn_uasa_gred_subjek(p_year uuid default null)
returns table(subject_id uuid, subjek text, warna text, jumlah bigint,
              gred_a bigint, gred_b bigint, gred_c bigint, gred_d bigint, gred_e bigint, gred_f bigint, purata numeric)
language sql stable as $$
  select s.id, s.nama, s.warna, count(sc.*),
    count(*) filter (where sc.gred='A'), count(*) filter (where sc.gred='B'),
    count(*) filter (where sc.gred='C'), count(*) filter (where sc.gred='D'),
    count(*) filter (where sc.gred='E'), count(*) filter (where sc.gred='F'),
    coalesce(round(avg(sc.markah),1),0)
  from subjects s
  join uasa_records r on r.subject_id = s.id and (p_year is null or r.year_id = p_year)
  join uasa_scores  sc on sc.uasa_id = r.id
  group by s.id, s.nama, s.warna
  order by 11 desc;
$$;

create or replace function fn_uasa_pass_subjek(p_year uuid default null)
returns table(subject_id uuid, subjek text, jumlah bigint, peratus_lulus numeric)
language sql stable as $$
  select s.id, s.nama, count(sc.*),
    coalesce(round(100.0 * count(*) filter (where sc.lulus) / nullif(count(sc.*),0), 1), 0)
  from subjects s
  join uasa_records r on r.subject_id = s.id and (p_year is null or r.year_id = p_year)
  join uasa_scores  sc on sc.uasa_id = r.id
  group by s.id, s.nama
  order by 4 desc;
$$;

create or replace function fn_uasa_cemerlang(p_year uuid default null)
returns table(student_id uuid, nama text, kelas text, tahun int, bil_subjek bigint, purata numeric, gred_terendah text)
language sql stable as $$
  select st.id, st.nama, k.nama, k.tahun, count(sc.*), round(avg(sc.markah),1), max(sc.gred)
  from students st
  join uasa_scores sc on sc.student_id = st.id
  join uasa_records r on r.id = sc.uasa_id and (p_year is null or r.year_id = p_year)
  left join classes k on k.id = st.kelas_id
  group by st.id, st.nama, k.nama, k.tahun
  order by 6 desc;
$$;

create or replace function fn_dashboard_uasa(p_year uuid default null)
returns table(purata_uasa numeric, peratus_lulus_uasa numeric)
language sql stable as $$
  select
    coalesce(round(avg(sc.markah),1),0),
    coalesce(round(100.0 * count(*) filter (where sc.lulus) / nullif(count(*),0),1),0)
  from uasa_scores sc join uasa_records r on r.id = sc.uasa_id
  where (p_year is null or r.year_id = p_year);
$$;

create or replace function fn_panitia_prestasi(p_year uuid default null)
returns table(subject_id uuid, subjek text, warna text, modul text, ketua text,
              bil_guru bigint, purata_uasa numeric, purata_tp numeric, status text)
language sql stable as $$
  select s.id, s.nama, s.warna, s.modul::text,
    (select p.nama from profiles p where p.panitia_subject_id = s.id and p.is_ketua_panitia limit 1),
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
  order by 7 desc;
$$;

create or replace function fn_kelas_prestasi(p_year uuid default null)
returns table(kelas_id uuid, kelas text, tahun int, bil_murid bigint,
              purata_uasa numeric, purata_tp numeric, peratus_lulus numeric, status text)
language sql stable as $$
  select k.id, k.nama, k.tahun,
    (select count(*) from students st where st.kelas_id=k.id and st.status='aktif'),
    coalesce(round((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
       where r.kelas_id=k.id and (p_year is null or r.year_id=p_year)),1),0),
    coalesce(round((select avg(a2.tp_level) from assessments a join assessment_scores a2 on a2.assessment_id=a.id
       where a.kelas_id=k.id and a2.tp_level is not null),1),0),
    coalesce(round((select 100.0*count(*) filter (where sc.lulus)/nullif(count(sc.*),0)
       from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
       where r.kelas_id=k.id and (p_year is null or r.year_id=p_year)),0),0),
    case
      when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
        where r.kelas_id=k.id and (p_year is null or r.year_id=p_year)),0) >= 74 then 'Cemerlang'
      when coalesce((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
        where r.kelas_id=k.id and (p_year is null or r.year_id=p_year)),0) >= 68 then 'Baik'
      else 'Sederhana'
    end
  from classes k
  order by k.tahun desc, k.nama;
$$;

create or replace function fn_tahun_prestasi(p_year uuid default null)
returns table(tahun int, bil_kelas bigint, bil_murid bigint, purata_uasa numeric)
language sql stable as $$
  select k.tahun, count(distinct k.id),
    (select count(*) from students st join classes c on c.id=st.kelas_id where c.tahun=k.tahun and st.status='aktif'),
    coalesce(round((select avg(sc.markah) from uasa_records r join uasa_scores sc on sc.uasa_id=r.id
       where r.tahun=k.tahun and (p_year is null or r.year_id=p_year)),1),0)
  from classes k
  group by k.tahun
  order by k.tahun desc;
$$;

grant execute on function
  fn_uasa_gred_overall(uuid), fn_uasa_gred_subjek(uuid), fn_uasa_pass_subjek(uuid),
  fn_uasa_cemerlang(uuid), fn_dashboard_uasa(uuid), fn_panitia_prestasi(uuid),
  fn_kelas_prestasi(uuid), fn_tahun_prestasi(uuid)
to authenticated, anon;

-- ---------- Ketatkan RLS markah UASA: admin / guru kelas / ketua panitia subjek ----------
drop policy if exists "uasa_records_write_own" on uasa_records;
create policy "uasa_records_write_own" on uasa_records for all to authenticated
  using (
    is_admin()
    or exists (select 1 from classes c where c.id = kelas_id and c.guru_kelas_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.panitia_subject_id = subject_id)
  )
  with check (
    is_admin()
    or exists (select 1 from classes c where c.id = kelas_id and c.guru_kelas_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.panitia_subject_id = subject_id)
  );
-- uasa_scores kekal ikut pemilik rekod induk (uasa_scores_write_own) — induk kini dikawal ketat.
