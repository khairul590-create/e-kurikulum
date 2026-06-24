import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "./guards";
import { PageLoader } from "@/components/ui/Misc";

const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
// V2 analisis
const UasaPage = lazy(() => import("@/features/uasa/UasaPage"));
const UasaEntryPage = lazy(() => import("@/features/uasa/UasaEntryPage"));
const PbdPage = lazy(() => import("@/features/pbd/PbdPage"));
const PanitiaPage = lazy(() => import("@/features/panitia/PanitiaPage"));
const PanitiaDetailPage = lazy(() => import("@/features/panitia/PanitiaDetailPage"));
const AnalisisKelasPage = lazy(() => import("@/features/analisis-kelas/AnalisisKelasPage"));
const AnalisisTahunPage = lazy(() => import("@/features/analisis-tahun/AnalisisTahunPage"));
const AnalisisMuridPage = lazy(() => import("@/features/analisis-murid/AnalisisMuridPage"));
const IntervensiPage = lazy(() => import("@/features/intervensi/IntervensiPage"));
const RekodRphPage = lazy(() => import("@/features/rekod-rph/RekodRphPage"));
const LaporanIndividuPage = lazy(() => import("@/features/reports/LaporanIndividuPage"));
const LaporanKelasPage = lazy(() => import("@/features/reports/LaporanKelasPage"));
const MuatTurunPage = lazy(() => import("@/features/reports/MuatTurunPage"));
// sedia ada
const RptPage = lazy(() => import("@/features/rpt/RptPage"));
const RphPage = lazy(() => import("@/features/rph/RphPage"));
const DskpPage = lazy(() => import("@/features/dskp/DskpPage"));
const KalendarPage = lazy(() => import("@/features/calendar/KalendarPage"));
const PdpPage = lazy(() => import("@/features/pdp/PdpPage"));
const PentaksiranPage = lazy(() => import("@/features/assessment/PentaksiranPage"));
const SbdPlcPage = lazy(() => import("@/features/sbd-plc/SbdPlcPage"));
const AnalisisPage = lazy(() => import("@/features/analysis/AnalisisPage"));
const LaporanPage = lazy(() => import("@/features/reports/LaporanPage"));
const KpiPage = lazy(() => import("@/features/kpi/KpiPage"));
const StudentsPage = lazy(() => import("@/features/students/StudentsPage"));
const TeachersPage = lazy(() => import("@/features/teachers/TeachersPage"));
const SubjectsPage = lazy(() => import("@/features/subjects/SubjectsPage"));
const ClassesPage = lazy(() => import("@/features/classes/ClassesPage"));
const RoomsPage = lazy(() => import("@/features/rooms/RoomsPage"));
const TetapanPage = lazy(() => import("@/features/settings/TetapanPage"));
const AuditLogPage = lazy(() => import("@/features/audit/AuditLogPage"));
const BantuanPage = lazy(() => import("@/features/help/BantuanPage"));

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;
const admin = (el: React.ReactNode) => <RoleGate>{wrap(el)}</RoleGate>;

export const router = createBrowserRouter([
  { path: "/login", element: wrap(<Login />) },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: wrap(<Dashboard />) },
      // V2 analisis
      { path: "uasa", element: wrap(<UasaPage />) },
      { path: "uasa/entry", element: admin(<UasaEntryPage />) },
      { path: "pbd", element: wrap(<PbdPage />) },
      { path: "panitia", element: wrap(<PanitiaPage />) },
      { path: "panitia/:subjectId", element: wrap(<PanitiaDetailPage />) },
      { path: "analisis-kelas", element: wrap(<AnalisisKelasPage />) },
      { path: "analisis-tahun", element: wrap(<AnalisisTahunPage />) },
      { path: "analisis-murid", element: wrap(<AnalisisMuridPage />) },
      { path: "intervensi", element: wrap(<IntervensiPage />) },
      { path: "rekod-rph", element: wrap(<RekodRphPage />) },
      { path: "laporan-individu", element: admin(<LaporanIndividuPage />) },
      { path: "laporan-kelas", element: admin(<LaporanKelasPage />) },
      { path: "muat-turun", element: admin(<MuatTurunPage />) },
      // sedia ada
      { path: "rpt", element: wrap(<RptPage />) },
      { path: "rph", element: wrap(<RphPage />) },
      { path: "dskp", element: wrap(<DskpPage />) },
      { path: "kalendar", element: wrap(<KalendarPage />) },
      { path: "pdp", element: wrap(<PdpPage />) },
      { path: "pentaksiran", element: wrap(<PentaksiranPage />) },
      { path: "sbd-plc", element: wrap(<SbdPlcPage />) },
      { path: "analisis", element: wrap(<AnalisisPage />) },
      { path: "laporan", element: admin(<LaporanPage />) },
      { path: "kpi", element: wrap(<KpiPage />) },
      { path: "murid", element: wrap(<StudentsPage />) },
      { path: "guru", element: admin(<TeachersPage />) },
      { path: "subjek", element: admin(<SubjectsPage />) },
      { path: "kelas", element: admin(<ClassesPage />) },
      { path: "bilik", element: admin(<RoomsPage />) },
      { path: "tetapan", element: admin(<TetapanPage />) },
      { path: "audit-log", element: admin(<AuditLogPage />) },
      { path: "bantuan", element: wrap(<BantuanPage />) },
    ],
  },
  { path: "*", element: wrap(<NotFound />) },
]);
