import {
  LayoutDashboard,
  BarChart3,
  Award,
  Layers,
  School,
  TrendingUp,
  GraduationCap,
  HeartPulse,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  FileText,
  CalendarDays,
  Users2,
  Gauge,
  FileBarChart,
  Download,
  Settings,
  UserCog,
  Users,
  BookMarked,
  DoorOpen,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}
export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    title: "Pengurusan Kurikulum",
    items: [
      { label: "Analisis UASA", to: "/uasa", icon: BarChart3 },
      { label: "Analisis PBD (TP)", to: "/pbd", icon: Award },
      { label: "Panitia & Subjek", to: "/panitia", icon: Layers },
      { label: "Analisis Kelas", to: "/analisis-kelas", icon: School },
      { label: "Analisis Tahun", to: "/analisis-tahun", icon: TrendingUp },
      { label: "Analisis Murid", to: "/analisis-murid", icon: GraduationCap },
      { label: "Program Intervensi", to: "/intervensi", icon: HeartPulse },
      { label: "Rekod RPH & PdP", to: "/rekod-rph", icon: ClipboardCheck },
      { label: "Rancangan Pengajaran", to: "/rpt", icon: BookOpen },
      { label: "RPH", to: "/rph", icon: ClipboardList },
      { label: "DSKP", to: "/dskp", icon: FileText },
      { label: "Kalendar Akademik", to: "/kalendar", icon: CalendarDays },
      { label: "Pelaksanaan PdP", to: "/pdp", icon: GraduationCap },
      { label: "Pentaksiran", to: "/pentaksiran", icon: ClipboardCheck },
      { label: "SBD & PLC", to: "/sbd-plc", icon: Users2 },
      { label: "Dashboard KPI", to: "/kpi", icon: Gauge },
    ],
  },
  {
    title: "Laporan",
    items: [
      { label: "Laporan Individu", to: "/laporan-individu", icon: FileText },
      { label: "Laporan Kelas", to: "/laporan-kelas", icon: FileBarChart },
      { label: "Muat Turun", to: "/muat-turun", icon: Download },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Tetapan", to: "/tetapan", icon: Settings, adminOnly: true },
      { label: "Pengguna", to: "/guru", icon: UserCog, adminOnly: true },
      { label: "Murid", to: "/murid", icon: Users, adminOnly: true },
      { label: "Mata Pelajaran", to: "/subjek", icon: BookMarked, adminOnly: true },
      { label: "Kelas", to: "/kelas", icon: School, adminOnly: true },
      { label: "Bilik & Kemudahan", to: "/bilik", icon: DoorOpen, adminOnly: true },
      { label: "Bantuan", to: "/bantuan", icon: LifeBuoy },
    ],
  },
];
