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
  FileText,
  FileBarChart,
  Download,
  Settings,
  UserCog,
  LifeBuoy,
  ClipboardList,
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

// Sidebar ikut mockup V2 (item lain spt RPT/DSKP/Kalendar/PdP/Pentaksiran/SBD/KPI
// + CRUD Murid/Subjek/Kelas/Bilik kekal sbg route, tapi disorok dari sidebar).
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
      { label: "Log Audit", to: "/audit-log", icon: ClipboardList, adminOnly: true },
      { label: "Bantuan", to: "/bantuan", icon: LifeBuoy },
    ],
  },
];
