-- ============================================================
-- V2: UASA (markah % + gred A–F), Program Intervensi, Pencerapan,
--     struktur KSSR modular, pautan Ketua Panitia → subjek.
-- Additive sahaja — tiada perubahan pada jadual sedia ada selain
-- tambah kolum baru.
-- ============================================================

-- ---------- KSSR modular + tanda subjek UASA + pautan panitia ----------
create type modul_kssr as enum ('teras_asas', 'teras_tema', 'elektif');

alter table subjects add column if not exists modul   modul_kssr;            -- nullable, backfill manual
alter table subjects add column if not exists is_uasa boolean not null default false;

alter table profiles add column if not exists panitia_subject_id uuid references subjects(id) on delete set null;

-- ---------- UASA: markah % + gred A–F (Tahun 4–6) ----------
-- Gred: A>=90, B>=80, C>=65, D>=50, E>=40, F<40 (gred & lulus berasingan).
-- Lulus: markah >= 20 (markah lulus minimum mengikut pelaporan UASA).
create type uasa_gred as enum ('A', 'B', 'C', 'D', 'E', 'F');

create table uasa_records (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  kelas_id   uuid references classes(id) on delete set null,
  tahun      int not null check (tahun between 4 and 6),
  year_id    uuid references academic_years(id),
  guru_id    uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table uasa_scores (
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

-- ---------- Program Intervensi & Pemulihan ----------
create type intervensi_status as enum ('aktif', 'selesai', 'dirancang');

create table intervensi_programs (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,                       -- "Celik 3M / LINUS"
  jenis      text,                                -- pemulihan / pengayaan / literasi / numerasi
  sasaran    text,                                -- objektif / kumpulan sasaran
  guru_id    uuid references profiles(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  kemajuan   int not null default 0 check (kemajuan between 0 and 100),
  status     intervensi_status not null default 'dirancang',
  created_at timestamptz not null default now()
);

create table intervensi_students (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references intervensi_programs(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  unique (program_id, student_id)
);

-- ---------- Pencerapan PdP (rating pemerhatian) ----------
create table pencerapan (
  id          uuid primary key default gen_random_uuid(),
  guru_id     uuid not null references profiles(id) on delete cascade,   -- guru dicerap
  pencerap_id uuid references profiles(id) on delete set null,           -- pencerap
  rph_id      uuid references rph(id) on delete set null,
  tarikh      date not null default now(),
  rating      int check (rating between 1 and 5),
  catatan     text,
  created_at  timestamptz not null default now()
);

-- ---------- Indeks ----------
create index idx_uasa_scores_uasa            on uasa_scores(uasa_id);
create index idx_uasa_scores_student         on uasa_scores(student_id);
create index idx_uasa_records_subject        on uasa_records(subject_id);
create index idx_uasa_records_tahun          on uasa_records(tahun);
create index idx_uasa_records_kelas          on uasa_records(kelas_id);
create index idx_intervensi_students_program on intervensi_students(program_id);
create index idx_pencerapan_guru             on pencerapan(guru_id);
