-- ============================================================
-- E-Kurikulum — Skema Pangkalan Data
-- Sistem Pengurusan Kurikulum Sekolah Rendah (KSSR)
-- ============================================================
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type user_role        as enum ('admin', 'guru');
create type rph_status       as enum ('selesai', 'dalam_proses', 'belum_mula');
create type assessment_type  as enum ('formatif', 'sumatif');
create type tahap_pencapaian as enum ('cemerlang', 'baik', 'memuaskan', 'perlu_bimbingan');
create type jantina_jenis    as enum ('L', 'P');
create type room_status      as enum ('aktif', 'penyelenggaraan', 'tidak_aktif');

-- ---------- Tahun Akademik ----------
create table academic_years (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,            -- "2024/2025"
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Tetapan Sekolah ----------
create table school_settings (
  id            int primary key default 1,
  nama_sekolah  text not null default 'SK Darau Kota Kinabalu',
  kod_sekolah   text,
  subtajuk      text default 'Kurikulum Sekolah Rendah',
  logo_url      text,
  alamat        text,
  tahun_semasa  uuid references academic_years(id),
  updated_at    timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ---------- Mata Pelajaran ----------
create table subjects (
  id         uuid primary key default gen_random_uuid(),
  kod        text not null unique,
  nama       text not null,
  warna      text not null default '#2563EB',
  created_at timestamptz not null default now()
);

-- ---------- Profil (ext auth.users) = Guru / Admin ----------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  nama            text not null,
  email           text,
  role            user_role not null default 'guru',
  is_ketua_panitia boolean not null default false,
  jawatan         text,                        -- "Guru Kelas 5 Bestari"
  no_telefon      text,
  avatar_url      text,
  status          text not null default 'aktif',
  created_at      timestamptz not null default now()
);

-- ---------- Kelas ----------
create table classes (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,                 -- "5 Bestari"
  tahun         int not null check (tahun between 1 and 6),
  guru_kelas_id uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- Murid ----------
create table students (
  id              uuid primary key default gen_random_uuid(),
  nama            text not null,
  no_sijil_lahir  text unique,
  jantina         jantina_jenis not null,
  kelas_id        uuid references classes(id) on delete set null,
  tarikh_masuk    date default now(),
  status          text not null default 'aktif',
  created_at      timestamptz not null default now()
);

-- ---------- Bilik & Kemudahan ----------
create table rooms (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  jenis      text,                             -- "Makmal", "Bilik Darjah"
  kapasiti   int,
  status     room_status not null default 'aktif',
  created_at timestamptz not null default now()
);

-- =========== PERANCANGAN ===========

-- Rancangan Pengajaran Tahunan
create table rpt (
  id              uuid primary key default gen_random_uuid(),
  subject_id      uuid not null references subjects(id) on delete cascade,
  tahun           int not null check (tahun between 1 and 6),
  year_id         uuid references academic_years(id),
  minggu          int,
  tajuk           text not null,
  standard_kandungan text,
  created_at      timestamptz not null default now()
);

-- Rancangan Pengajaran Harian
create table rph (
  id          uuid primary key default gen_random_uuid(),
  guru_id     uuid not null references profiles(id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete cascade,
  kelas_id    uuid references classes(id) on delete set null,
  tarikh      date not null default now(),
  minggu      int,
  tajuk       text not null,
  objektif    text,
  aktiviti    text,
  refleksi    text,
  status      rph_status not null default 'belum_mula',
  created_at  timestamptz not null default now()
);

-- DSKP
create table dskp (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references subjects(id) on delete cascade,
  tahun       int not null check (tahun between 1 and 6),
  tajuk       text not null,
  dokumen_url text,
  standard    jsonb,
  created_at  timestamptz not null default now()
);

-- Kalendar Akademik
create table calendar_events (
  id           uuid primary key default gen_random_uuid(),
  tajuk        text not null,
  jenis        text default 'umum',            -- cuti, peperiksaan, program, mesyuarat
  tarikh_mula  date not null,
  tarikh_tamat date,
  keterangan   text,
  created_at   timestamptz not null default now()
);

-- =========== PELAKSANAAN ===========

-- Pelaksanaan PdP (log pengajaran)
create table pdp_logs (
  id          uuid primary key default gen_random_uuid(),
  guru_id     uuid not null references profiles(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete set null,
  kelas_id    uuid references classes(id) on delete set null,
  tarikh      date not null default now(),
  tajuk       text not null,
  catatan     text,
  created_at  timestamptz not null default now()
);

-- Pentaksiran
create table assessments (
  id          uuid primary key default gen_random_uuid(),
  jenis       assessment_type not null,
  subject_id  uuid not null references subjects(id) on delete cascade,
  kelas_id    uuid references classes(id) on delete set null,
  guru_id     uuid references profiles(id) on delete set null,
  tarikh      date not null default now(),
  tajuk       text not null,
  created_at  timestamptz not null default now()
);

-- Skor / Pencapaian Murid
create table assessment_scores (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  markah        numeric(5,2),
  tp_level      int check (tp_level between 1 and 6),
  tahap         tahap_pencapaian,
  created_at    timestamptz not null default now(),
  unique (assessment_id, student_id)
);

-- SBD & PLC
create table sbd_plc (
  id         uuid primary key default gen_random_uuid(),
  jenis      text not null default 'PLC',      -- SBD / PLC
  tajuk      text not null,
  tarikh     date not null default now(),
  guru_id    uuid references profiles(id) on delete set null,
  catatan    text,
  created_at timestamptz not null default now()
);

-- =========== ANALISIS & SISTEM ===========

-- Pengumuman
create table announcements (
  id         uuid primary key default gen_random_uuid(),
  tajuk      text not null,
  kandungan  text,
  jenis      text default 'umum',              -- mesyuarat, tarikh_akhir, program
  tarikh     date not null default now(),
  pinned     boolean not null default false,
  created_at timestamptz not null default now()
);

-- Aktiviti Terbaru (audit log)
create table activities (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references profiles(id) on delete set null,
  actor_nama text,
  action     text not null,                    -- "RPH Dikemaskini"
  modul      text,
  detail     text,
  created_at timestamptz not null default now()
);

-- Dashboard KPI
create table kpi_targets (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  sasaran    numeric not null,
  semasa     numeric not null default 0,
  unit       text default '%',
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index idx_students_kelas    on students(kelas_id);
create index idx_rph_guru          on rph(guru_id);
create index idx_rph_subject       on rph(subject_id);
create index idx_rph_status        on rph(status);
create index idx_scores_assessment on assessment_scores(assessment_id);
create index idx_scores_student    on assessment_scores(student_id);
create index idx_activities_time   on activities(created_at desc);

-- ---------- Auto-create profile on signup ----------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'guru')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
