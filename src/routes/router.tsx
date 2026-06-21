import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, RoleGate } from "./guards";
import { PageLoader } from "@/components/ui/Misc";

const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
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
const BantuanPage = lazy(() => import("@/features/help/BantuanPage"));

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;
const admin = (el: React.ReactNode) => <RoleGate>{wrap(el)}</RoleGate>;

export const router = createBrowserRouter([
  { path: "/login", element: wrap(<Login />) },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: wrap(<Dashboard />) },
      { path: "rpt", element: wrap(<RptPage />) },
      { path: "rph", element: wrap(<RphPage />) },
      { path: "dskp", element: wrap(<DskpPage />) },
      { path: "kalendar", element: wrap(<KalendarPage />) },
      { path: "pdp", element: wrap(<PdpPage />) },
      { path: "pentaksiran", element: wrap(<PentaksiranPage />) },
      { path: "sbd-plc", element: wrap(<SbdPlcPage />) },
      { path: "analisis", element: wrap(<AnalisisPage />) },
      { path: "laporan", element: wrap(<LaporanPage />) },
      { path: "kpi", element: wrap(<KpiPage />) },
      { path: "murid", element: wrap(<StudentsPage />) },
      { path: "guru", element: admin(<TeachersPage />) },
      { path: "subjek", element: admin(<SubjectsPage />) },
      { path: "kelas", element: admin(<ClassesPage />) },
      { path: "bilik", element: admin(<RoomsPage />) },
      { path: "tetapan", element: admin(<TetapanPage />) },
      { path: "bantuan", element: wrap(<BantuanPage />) },
    ],
  },
  { path: "*", element: wrap(<NotFound />) },
]);
