// Domain types — selari dengan supabase/migrations/0001_schema.sql
export type Role = "admin" | "guru";
export type RphStatus = "selesai" | "dalam_proses" | "belum_mula";
export type AssessmentType = "formatif" | "sumatif";
export type Tahap = "cemerlang" | "baik" | "memuaskan" | "perlu_bimbingan";
export type Jantina = "L" | "P";
export type RoomStatus = "aktif" | "penyelenggaraan" | "tidak_aktif";
export type ModulKssr = "teras_asas" | "teras_tema" | "elektif";
export type UasaGred = "A" | "B" | "C" | "D" | "E" | "F";
export type IntervensiStatus = "aktif" | "selesai" | "dirancang";

export interface Profile {
  id: string;
  nama: string;
  email: string | null;
  role: Role;
  is_ketua_panitia: boolean;
  panitia_subject_id: string | null;
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
  guru_besar_id: string | null;
  pk1_id: string | null;
  pk_hem_id: string | null;
  pk_koko_id: string | null;
  pk_petang_id: string | null;
}

export interface Subject {
  id: string;
  kod: string;
  nama: string;
  warna: string;
  modul: ModulKssr | null;
  is_uasa: boolean;
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

export interface OprReport {
  id: string;
  tajuk: string;
  anjuran: string | null;
  tarikh_mula: string | null;
  tarikh_tamat: string | null;
  masa: string | null;
  tempat: string | null;
  sasaran: string | null;
  bil_peserta: number | null;
  objektif: string | null;
  pelaksanaan: string | null;
  kekuatan: string | null;
  penambahbaikan: string | null;
  refleksi: string | null;
  kos: number | null;
  disediakan_oleh: string | null;
  disahkan_oleh: string | null;
  gambar: string[];
  status: string;
  guru_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JadualWaktu {
  id: string;
  guru_id: string;
  hari: number; // 1=Isnin .. 5=Jumaat
  masa_mula: string; // "08:00:00"
  masa_akhir: string;
  kelas_id: string | null;
  subject_id: string | null;
  bilik: string | null;
  sesi: string; // pagi / petang
  year_id: string | null;
  created_at: string;
}

// Bentuk dengan join (untuk paparan grid / senarai)
export interface JadualRow extends JadualWaktu {
  guru: { nama: string } | null;
  kelas: { nama: string } | null;
  subjek: { nama: string; warna: string } | null;
}

// View shapes
export interface DashboardStats {
  jum_subjek: number;
  jum_guru: number;
  jum_murid: number;
  peratus_rph: number;
  purata_pencapaian: number;
  jum_kelas: number;
  purata_uasa: number;
  peratus_lulus_uasa: number;
  purata_tp: number;
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

// ---------- V2: UASA / Intervensi / Pencerapan ----------
export interface UasaRecord {
  id: string;
  subject_id: string;
  kelas_id: string | null;
  tahun: number;
  year_id: string | null;
  guru_id: string | null;
  created_at: string;
}
export interface UasaScore {
  id: string;
  uasa_id: string;
  student_id: string;
  markah: number;
  gred: UasaGred;
  lulus: boolean;
  created_at: string;
}
export interface IntervensiProgram {
  id: string;
  nama: string;
  jenis: string | null;
  sasaran: string | null;
  guru_id: string | null;
  subject_id: string | null;
  kemajuan: number;
  status: IntervensiStatus;
  created_at: string;
}
export interface IntervensiStudent {
  id: string;
  program_id: string;
  student_id: string;
}
export interface Pencerapan {
  id: string;
  guru_id: string;
  pencerap_id: string | null;
  rph_id: string | null;
  tarikh: string;
  rating: number | null;
  catatan: string | null;
  created_at: string;
}
export interface PanitiaFail {
  subject_id: string;
  drive_url: string | null;
  carta_url: string | null;
  catatan: string | null;
  updated_at: string;
}

// ---------- V2 view shapes ----------
export interface UasaGredSubjek {
  subject_id: string;
  subjek: string;
  warna: string;
  jumlah: number;
  gred_a: number;
  gred_b: number;
  gred_c: number;
  gred_d: number;
  gred_e: number;
  gred_f: number;
  purata: number;
}
export interface UasaGredOverall {
  gred: UasaGred;
  bilangan: number;
  peratus: number;
}
export interface UasaPassSubjek {
  subject_id: string;
  subjek: string;
  jumlah: number;
  peratus_lulus: number;
}
export interface UasaCemerlangMurid {
  student_id: string;
  nama: string;
  kelas: string | null;
  tahun: number | null;
  bil_subjek: number;
  purata: number;
  gred_terendah: UasaGred | null;
}
export interface PbdTpTaburan {
  tp: number;
  bilangan: number;
  peratus: number;
}
export interface PbdTpSubjek {
  subject_id: string;
  subjek: string;
  warna: string;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  tp5: number;
  tp6: number;
  tp_purata: number;
}
export interface PanitiaPrestasi {
  subject_id: string;
  subjek: string;
  warna: string;
  modul: ModulKssr | null;
  ketua: string | null;
  bil_guru: number;
  purata_uasa: number;
  purata_tp: number;
  status: string;
}
export interface KelasPrestasi {
  kelas_id: string;
  kelas: string;
  tahun: number;
  bil_murid: number;
  purata_uasa: number;
  purata_tp: number;
  peratus_lulus: number;
  status: string;
}
export interface TahunPrestasi {
  tahun: number;
  bil_kelas: number;
  bil_murid: number;
  purata_uasa: number;
}
export interface TahunTrendGps {
  sesi: string;
  semasa: boolean;
  purata: number;
}
export interface KssrModular {
  modul: string;
  bilangan: number;
  senarai: string | null;
}
export interface RphGuruStatus {
  guru_id: string;
  guru: string;
  subjek: string | null;
  jum_rph: number;
  rph_selesai: number;
  peratus_selesai: number;
  rating_pencerapan: number | null;
}
export interface IntervensiRingkasan {
  id: string;
  nama: string;
  jenis: string | null;
  sasaran: string | null;
  kemajuan: number;
  status: IntervensiStatus;
  guru: string | null;
  subjek: string | null;
  bil_murid: number;
}
