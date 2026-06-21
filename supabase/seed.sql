-- ============================================================
-- Seed Data — E-Kurikulum (data contoh untuk demo)
-- Akaun: admin@kurikulum.test / cikgu.ahmad@kurikulum.test ... + 40 guru
-- Kata laluan semua: password123
-- ============================================================

-- ---------- Tahun Akademik ----------
insert into academic_years (id, label, is_current) values
  ('11111111-1111-1111-1111-111111111111', '2023/2024', false),
  ('22222222-2222-2222-2222-222222222222', '2024/2025', true);

insert into school_settings (id, nama_sekolah, kod_sekolah, subtajuk, tahun_semasa)
values (1, 'SK Darau Kota Kinabalu', 'ABC1234', 'Kurikulum Sekolah Rendah',
        '22222222-2222-2222-2222-222222222222');

-- ---------- Mata Pelajaran (13) ----------
insert into subjects (kod, nama, warna) values
  ('BM',  'Bahasa Melayu',        '#2563EB'),
  ('BI',  'Bahasa Inggeris',      '#0EA5E9'),
  ('MT',  'Matematik',            '#16A34A'),
  ('SN',  'Sains',                '#F59E0B'),
  ('SJ',  'Sejarah',              '#8B5CF6'),
  ('PI',  'Pendidikan Islam',     '#0D9488'),
  ('PM',  'Pendidikan Moral',     '#DB2777'),
  ('PJ',  'Pendidikan Jasmani',   '#EF4444'),
  ('PK',  'Pendidikan Kesihatan', '#F97316'),
  ('PSV', 'Pend. Seni Visual',    '#A855F7'),
  ('PM2', 'Pend. Muzik',          '#14B8A6'),
  ('RBT', 'Reka Bentuk & Tek.',   '#6366F1'),
  ('TMK', 'Teknologi Maklumat',   '#3B82F6');

-- ---------- Akaun pengguna (auth.users + profiles via trigger) ----------
do $$
declare
  uid uuid;
  i int;
  nama_depan text[] := array['Ahmad','Siti','Nurul','Mohd','Aisyah','Faizal','Hafiz','Zainab',
    'Ramesh','Suriya','Lim','Tan','Wong','Kavitha','Daniel','Farah','Izzat','Liyana',
    'Hakim','Salmah','Azman','Rohani','Khalid','Mariam','Syafiq','Aina','Hassan','Yusof',
    'Noraini','Razak','Halim','Fatimah','Idris','Junita','Kamal','Latifah','Munirah',
    'Nabil','Othman','Puteri'];
  nama_blkg text[] := array['bin Abdullah','binti Hassan','bin Omar','binti Yusof','a/l Kumar',
    'a/p Devi','bin Ismail','binti Karim'];
begin
  -- Admin
  uid := gen_random_uuid();
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    created_at,updated_at,raw_app_meta_data,raw_user_meta_data,is_sso_user,is_anonymous)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated','authenticated',
    'admin@kurikulum.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"nama":"Pn. Roslina (Pentadbir)","role":"admin"}', false, false);
  insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values (uid::text, uid, format('{"sub":"%s","email":"admin@kurikulum.test"}', uid)::jsonb,
    'email', now(), now(), now());
  update profiles set jawatan = 'Guru Besar', is_ketua_panitia = true where id = uid;

  -- Cikgu Ahmad (guru utama dalam mockup)
  uid := gen_random_uuid();
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    created_at,updated_at,raw_app_meta_data,raw_user_meta_data,is_sso_user,is_anonymous)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated','authenticated',
    'cikgu.ahmad@kurikulum.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"nama":"Cikgu Ahmad","role":"guru"}', false, false);
  insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values (uid::text, uid, format('{"sub":"%s","email":"cikgu.ahmad@kurikulum.test"}', uid)::jsonb,
    'email', now(), now(), now());
  update profiles set jawatan = 'Guru Kelas 5 Bestari', is_ketua_panitia = true where id = uid;

  -- 40 guru tambahan (jumlah guru = 42)
  for i in 1..40 loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
      created_at,updated_at,raw_app_meta_data,raw_user_meta_data,is_sso_user,is_anonymous)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated','authenticated',
      'guru'||i||'@kurikulum.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      format('{"nama":"%s %s","role":"guru"}',
        nama_depan[1 + (i % array_length(nama_depan,1))],
        nama_blkg[1 + (i % array_length(nama_blkg,1))])::jsonb,
      false, false);
    insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (uid::text, uid, format('{"sub":"%s","email":"guru%s@kurikulum.test"}', uid, i)::jsonb,
      'email', now(), now(), now());
    update profiles set jawatan = 'Guru Mata Pelajaran',
      is_ketua_panitia = (i <= 6) where id = uid;
  end loop;
end $$;

-- ---------- Betulkan kolum token NULL (GoTrue perlu '' bukan NULL) ----------
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where confirmation_token is null or recovery_token is null or email_change is null;

-- ---------- Kelas (4 kelas x 6 tahun = 24) ----------
do $$
declare
  nm text[] := array['Bestari','Cemerlang','Gemilang','Bijak'];
  t int; k int;
begin
  for t in 1..6 loop
    for k in 1..4 loop
      insert into classes (nama, tahun, guru_kelas_id)
      values (t || ' ' || nm[k], t,
        (select id from profiles where role = 'guru' order by random() limit 1));
    end loop;
  end loop;
end $$;

-- ---------- Murid (762) ----------
do $$
declare
  i int;
  dpn text[] := array['Aiman','Nur Aisyah','Muhammad','Siti Sarah','Danish','Qaisara','Adam',
    'Maryam','Haziq','Sofia','Iman','Aleeya','Arif','Balqis','Iskandar','Nadia','Zikri',
    'Hana','Rayyan','Alya','Luqman','Insyirah','Daniel','Wan Nur','Harith','Elya'];
  blkg text[] := array['bin Rahman','binti Aziz','bin Salleh','binti Razak','a/l Suresh',
    'a/p Letchumi','bin Farid','binti Halim','bin Zaki','binti Noor'];
  kls uuid[];
begin
  select array_agg(id) into kls from classes;
  for i in 1..762 loop
    insert into students (nama, no_sijil_lahir, jantina, kelas_id, tarikh_masuk, status)
    values (
      dpn[1 + (i % array_length(dpn,1))] || ' ' || blkg[1 + (i % array_length(blkg,1))],
      lpad((130000000000 + i)::text, 12, '0'),
      (case when i % 2 = 0 then 'L' else 'P' end)::jantina_jenis,
      kls[1 + (i % array_length(kls,1))],
      date '2024-01-02',
      'aktif'
    );
  end loop;
end $$;

-- ---------- Bilik & Kemudahan ----------
insert into rooms (nama, jenis, kapasiti, status) values
  ('Makmal Sains 1','Makmal',40,'aktif'),
  ('Makmal Komputer','Makmal',35,'aktif'),
  ('Bilik Akses','Bilik Khas',30,'aktif'),
  ('Pusat Sumber','Perpustakaan',80,'aktif'),
  ('Bilik Muzik','Bilik Khas',30,'penyelenggaraan'),
  ('Bilik Seni','Bilik Khas',30,'aktif'),
  ('Dewan Serbaguna','Dewan',300,'aktif'),
  ('Bilik PSV','Bilik Khas',30,'aktif');

-- ---------- RPH (~1402; 89% selesai / 8% proses / 3% belum) ----------
do $$
declare
  i int;
  st rph_status;
  guru uuid[]; subj uuid[]; kls uuid[];
  tajuk_list text[] := array['Pengenalan Topik','Latih Tubi','Pengukuhan Konsep','Aktiviti Kumpulan',
    'Pentaksiran Bilik Darjah','Ulangkaji','Projek Mini','Perbincangan','Eksperimen','Pembentangan'];
begin
  select array_agg(id) into guru from profiles where role = 'guru';
  select array_agg(id) into subj from subjects;
  select array_agg(id) into kls  from classes;
  for i in 1..1402 loop
    st := case
      when i % 100 < 89 then 'selesai'
      when i % 100 < 97 then 'dalam_proses'
      else 'belum_mula' end::rph_status;
    insert into rph (guru_id, subject_id, kelas_id, tarikh, minggu, tajuk, objektif, aktiviti, status)
    values (
      guru[1 + (i % array_length(guru,1))],
      subj[1 + (i % array_length(subj,1))],
      kls[1 + (i % array_length(kls,1))],
      date '2024-05-01' - (i % 90),
      1 + (i % 20),
      tajuk_list[1 + (i % array_length(tajuk_list,1))],
      'Murid dapat menguasai kemahiran asas pada akhir sesi PdP.',
      'Set induksi, aktiviti kumpulan, penilaian dan refleksi.',
      st
    );
  end loop;
end $$;

-- ---------- Pentaksiran + Skor (taburan tahap: 24/54/17/5, purata ~78) ----------
do $$
declare
  a_id uuid;
  subj uuid[]; kls uuid[]; guru uuid[]; murid uuid[];
  i int; j int; m numeric; tp int; th tahap_pencapaian;
begin
  select array_agg(id) into subj  from subjects;
  select array_agg(id) into kls   from classes;
  select array_agg(id) into guru  from profiles where role = 'guru';
  select array_agg(id) into murid from students;

  for i in 1..60 loop
    insert into assessments (jenis, subject_id, kelas_id, guru_id, tarikh, tajuk)
    values (
      (case when i % 3 = 0 then 'sumatif' else 'formatif' end)::assessment_type,
      subj[1 + (i % array_length(subj,1))],
      kls[1 + (i % array_length(kls,1))],
      guru[1 + (i % array_length(guru,1))],
      date '2024-05-01' - (i % 120),
      'Pentaksiran ' || (case when i % 3 = 0 then 'Sumatif ' else 'Formatif ' end) || i
    ) returning id into a_id;

    -- 40 skor murid setiap pentaksiran
    for j in 1..40 loop
      -- taburan tahap
      if (i*40+j) % 100 < 24 then m := 90 + (j % 10); tp := 6; th := 'cemerlang';
      elsif (i*40+j) % 100 < 78 then m := 75 + (j % 14); tp := 5; th := 'baik';
      elsif (i*40+j) % 100 < 95 then m := 60 + (j % 14); tp := 4; th := 'memuaskan';
      else m := 40 + (j % 18); tp := 2; th := 'perlu_bimbingan';
      end if;
      insert into assessment_scores (assessment_id, student_id, markah, tp_level, tahap)
      values (a_id, murid[1 + ((i*40+j) % array_length(murid,1))], m, tp, th)
      on conflict do nothing;
    end loop;
  end loop;
end $$;

-- ---------- Pengumuman ----------
insert into announcements (tajuk, kandungan, jenis, tarikh, pinned) values
  ('Mesyuarat Kurikulum Bil. 3/2024','22 Mei 2024 (Rabu) | 2:30 petang | Bilik Mesyuarat','mesyuarat','2024-05-20', true),
  ('Penyerahan RPH Sesi 2','Tarikh akhir: 31 Mei 2024 (Jumaat)','tarikh_akhir','2024-05-18', false),
  ('Program NILAM peringkat sekolah','3 - 7 Jun 2024','program','2024-05-17', false),
  ('Taklimat Pentaksiran Bilik Darjah','Semua guru wajib hadir','mesyuarat','2024-05-15', false);

-- ---------- Kalendar Akademik ----------
insert into calendar_events (tajuk, jenis, tarikh_mula, tarikh_tamat, keterangan) values
  ('Mesyuarat Kurikulum 3/2024','mesyuarat','2024-05-22','2024-05-22','Bilik Mesyuarat'),
  ('Penyerahan RPH Sesi 2','tarikh_akhir','2024-05-31','2024-05-31', null),
  ('Program NILAM','program','2024-06-03','2024-06-07','Peringkat sekolah'),
  ('Cuti Pertengahan Tahun','cuti','2024-05-25','2024-06-09', null),
  ('Peperiksaan Pertengahan Tahun','peperiksaan','2024-05-13','2024-05-17', null);

-- ---------- Aktiviti Terbaru ----------
insert into activities (actor_nama, action, modul, detail, created_at) values
  ('Cikgu Ahmad','RPH Dikemaskini','RPH','RPH Bahasa Melayu Tahun 5 - Minggu 9','2024-05-22 09:15'),
  ('Cikgu Siti Nur','Pentaksiran Dicatat','Pentaksiran','Pentaksiran Formatif 1 - Matematik Tahun 4','2024-05-22 08:45'),
  ('Cikgu Ahmad','Laporan Dijana','Laporan','Laporan Pencapaian Murid - Sesi 1 2024/2025','2024-05-21 16:30'),
  ('Cikgu Ramesh','Aktiviti PdP Didaftarkan','PdP','Eksperimen Sains Tahun 6 - Unit 3','2024-05-21 14:10'),
  ('Admin Kuri','Murid Ditambah','Murid','Penambahan murid baru Tahun 2 Amanah','2024-05-21 10:05');

-- ---------- SBD & PLC ----------
insert into sbd_plc (jenis, tajuk, tarikh, catatan) values
  ('PLC','Lesson Study Matematik Tahun 4','2024-05-10','Fokus kemahiran pecahan'),
  ('PLC','Peer Coaching Bahasa Inggeris','2024-05-12','Teknik soal jawab'),
  ('SBD','Pencerapan PdP Sains','2024-05-14','Pencerapan oleh GPK Kurikulum');

-- ---------- KPI ----------
insert into kpi_targets (nama, sasaran, semasa, unit) values
  ('Penyediaan RPH', 100, 89, '%'),
  ('Pencapaian Murid (TP4+)', 80, 78, '%'),
  ('Pelaksanaan Pentaksiran', 100, 87, '%'),
  ('Penglibatan PLC Guru', 90, 82, '%');
