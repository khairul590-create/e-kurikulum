// Domain types — selari dengan supabase/migrations/0001_schema.sql
export type Role = "admin" | "guru";
export type RphStatus = "selesai" | "dalam_proses" | "belum_mula";
export type AssessmentType = "formatif" | "sumatif";
export type Tahap = "cemerlang" | "baik" | "memuaskan" | "perlu_bimbingan";
export type Jantina = "L" | "P";
export type RoomStatus = "aktif" | "penyelenggaraan" | "tidak_aktif";

export interface Profile {
  id: string;
  nama: string;
  email: string | null;
  role: Role;
  is_ketua_panitia: boolean;
  jawatan: string | null;
  no_telefon: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  label: string;
  is_current: boolean;
}

export interface SchoolSettings {
  id: number;
  nama_sekolah: string;
  kod_sekolah: string | null;
  subtajuk: string | null;
  logo_url: string | null;
  alamat: string | null;
  tahun_semasa: string | null;
}

export interface Subject {
  id: string;
  kod: string;
  nama: string;
  warna: string;
  created_at: string;
}

export interface Kelas {
  id: string;
  nama: string;
  tahun: number;
  guru_kelas_id: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  nama: string;
  no_sijil_lahir: string | null;
  jantina: Jantina;
  kelas_id: string | null;
  tarikh_masuk: string | null;
  status: string;
  created_at: string;
}

export interface Room {
  id: string;
  nama: string;
  jenis: string | null;
  kapasiti: number | null;
  status: RoomStatus;
  created_at: string;
}

export interface Rpt {
  id: string;
  subject_id: string;
  tahun: number;
  year_id: string | null;
  minggu: number | null;
  tajuk: string;
  standard_kandungan: string | null;
  created_at: string;
}

export interface Rph {
  id: string;
  guru_id: string;
  subject_id: string;
  kelas_id: string | null;
  tarikh: string;
  minggu: number | null;
  tajuk: string;
  objektif: string | null;
  aktiviti: string | null;
  refleksi: string | null;
  status: RphStatus;
  created_at: string;
}

export interface Dskp {
  id: string;
  subject_id: string;
  tahun: number;
  tajuk: string;
  dokumen_url: string | null;
  standard: unknown;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  tajuk: string;
  jenis: string;
  tarikh_mula: string;
  tarikh_tamat: string | null;
  keterangan: string | null;
  created_at: string;
}

export interface PdpLog {
  id: string;
  guru_id: string;
  subject_id: string | null;
  kelas_id: string | null;
  tarikh: string;
  tajuk: string;
  catatan: string | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  jenis: AssessmentType;
  subject_id: string;
  kelas_id: string | null;
  guru_id: string | null;
  tarikh: string;
  tajuk: string;
  created_at: string;
}

export interface AssessmentScore {
  id: string;
  assessment_id: string;
  student_id: string;
  markah: number | null;
  tp_level: number | null;
  tahap: Tahap | null;
  created_at: string;
}

export interface SbdPlc {
  id: string;
  jenis: string;
  tajuk: string;
  tarikh: string;
  guru_id: string | null;
  catatan: string | null;
  created_at: string;
}

export interface Pajsk {
  id: string;
  student_id: string | null;
  aktiviti: string;
  jenis: string | null;
  pencapaian: string | null;
  markah: number | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  tajuk: string;
  kandungan: string | null;
  jenis: string;
  tarikh: string;
  pinned: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  actor_id: string | null;
  actor_nama: string | null;
  action: string;
  modul: string | null;
  detail: string | null;
  created_at: string;
}

export interface KpiTarget {
  id: string;
  nama: string;
  sasaran: number;
  semasa: number;
  unit: string;
}

// View shapes
export interface DashboardStats {
  jum_subjek: number;
  jum_guru: number;
  jum_murid: number;
  peratus_rph: number;
  purata_pencapaian: number;
  jum_kelas: number;
}
export interface PencapaianTaburan {
  tahap: Tahap;
  bilangan: number;
  peratus: number;
}
export interface RphStatusRow {
  status: RphStatus;
  bilangan: number;
  peratus: number;
}
export interface RphPerSubject {
  subject_id: string;
  subjek: string;
  warna: string;
  jumlah: number;
  peratus_selesai: number;
}
export interface TrendRow {
  bulan: string;
  bulan_no: number;
  purata: number;
}
export interface PentaksiranRingkasan {
  formatif: number;
  sumatif: number;
  peratus_tp4_atas: number;
}
