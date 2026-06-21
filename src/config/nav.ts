import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  Users2,
  BarChart3,
  FileBarChart,
  Gauge,
  Users,
  UserCog,
  BookMarked,
  School,
  DoorOpen,
  Settings,
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
    title: "Perancangan",
    items: [
      { label: "Rancangan Pengajaran", to: "/rpt", icon: BookOpen },
      { label: "RPH", to: "/rph", icon: ClipboardList },
      { label: "DSKP", to: "/dskp", icon: FileText },
      { label: "Kalendar Akademik", to: "/kalendar", icon: CalendarDays },
    ],
  },
  {
    title: "Pelaksanaan",
    items: [
      { label: "Pelaksanaan PdP", to: "/pdp", icon: GraduationCap },
      { label: "Pentaksiran", to: "/pentaksiran", icon: ClipboardCheck },
      { label: "SBD & PLC", to: "/sbd-plc", icon: Users2 },
    ],
  },
  {
    title: "Analisis",
    items: [
      { label: "Analisis Pencapaian", to: "/analisis", icon: BarChart3 },
      { label: "Laporan", to: "/laporan", icon: FileBarChart },
      { label: "Dashboard KPI", to: "/kpi", icon: Gauge },
    ],
  },
  {
    title: "Pengurusan",
    items: [
      { label: "Murid", to: "/murid", icon: Users },
      { label: "Guru", to: "/guru", icon: UserCog, adminOnly: true },
      { label: "Mata Pelajaran", to: "/subjek", icon: BookMarked, adminOnly: true },
      { label: "Kelas", to: "/kelas", icon: School, adminOnly: true },
      { label: "Bilik & Kemudahan", to: "/bilik", icon: DoorOpen, adminOnly: true },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Tetapan", to: "/tetapan", icon: Settings, adminOnly: true },
      { label: "Bantuan", to: "/bantuan", icon: LifeBuoy },
    ],
  },
];
