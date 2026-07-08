import {
  LayoutDashboard,
  BarChart3,
  Award,
  Layers,
  School,
  FolderOpen,
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
  Users,
  BookOpen,
  DoorOpen,
  ScrollText,
  Clock,
  CalendarClock,
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
      { label: "Fail Drive Setiausaha", to: "/dokumen-setiausaha", icon: FolderOpen },
      { label: "Analisis Kelas", to: "/analisis-kelas", icon: School },
      { label: "Analisis Tahun", to: "/analisis-tahun", icon: TrendingUp },
      { label: "Analisis Murid", to: "/analisis-murid", icon: GraduationCap },
      { label: "Program Intervensi", to: "/intervensi", icon: HeartPulse },
      { label: "Rekod RPH & PdP", to: "/rekod-rph", icon: ClipboardCheck },
      { label: "Jadual Waktu Guru", to: "/jadual", icon: Clock },
    ],
  },
  {
    title: "Data Asas",
    items: [
      { label: "Murid", to: "/murid", icon: Users, adminOnly: true },
      { label: "Kelas", to: "/kelas", icon: School, adminOnly: true },
      { label: "Subjek", to: "/subjek", icon: BookOpen, adminOnly: true },
      { label: "Bilik", to: "/bilik", icon: DoorOpen, adminOnly: true },
    ],
  },
  {
    title: "Laporan",
    items: [
      { label: "Laporan OPR", to: "/opr", icon: ScrollText },
      { label: "Laporan Individu", to: "/laporan-individu", icon: FileText },
      { label: "Laporan Kelas", to: "/laporan-kelas", icon: FileBarChart },
      { label: "Muat Turun", to: "/muat-turun", icon: Download },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Sesi Akademik", to: "/sesi", icon: CalendarClock, adminOnly: true },
      { label: "Tetapan", to: "/tetapan", icon: Settings, adminOnly: true },
      { label: "Guru & Pengguna", to: "/guru", icon: UserCog, adminOnly: true },
      { label: "Log Audit", to: "/audit-log", icon: ClipboardList, adminOnly: true },
      { label: "Bantuan", to: "/bantuan", icon: LifeBuoy },
    ],
  },
];
