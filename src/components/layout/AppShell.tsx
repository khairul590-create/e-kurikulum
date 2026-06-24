import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Loader2, GraduationCap } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ActionBar } from "./ActionBar";
import { Footer } from "./Footer";
import { navGroups } from "@/config/nav";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

function useTitle() {
  const { pathname } = useLocation();
  const items = navGroups.flatMap((g) => g.items).sort((a, b) => b.to.length - a.to.length);
  for (const i of items) {
    if (i.to === pathname || (i.to !== "/" && pathname.startsWith(i.to))) return i.label;
  }
  return "Dashboard Kurikulum";
}

const ADMIN_EMAIL = "admin@kurikulum.test";

function GuestLoginPanel() {
  const { signIn } = useAuth();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    setBusy(true);
    const { error } = await signIn(ADMIN_EMAIL, password);
    setBusy(false);
    if (error) setErr("Kata laluan salah. Cuba semula.");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] p-4">
      {/* blur blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#5c6bc0]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 size-72 rounded-full bg-[#7986cb]/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-[380px] rounded-3xl bg-white px-8 py-10 shadow-2xl">
        {/* Icon */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="grid size-[72px] place-items-center rounded-[22px] bg-gradient-to-br from-[#3949ab] via-[#5c6bc0] to-[#7986cb] shadow-lg">
            <GraduationCap className="size-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-extrabold tracking-tight text-[#1a237e]">
              E-Kurikulum
            </h1>
            <p className="mt-0.5 text-[13px] text-[#666]">
              SK Darau · Log masuk untuk teruskan
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Kata laluan admin"
            autoFocus
            className="w-full rounded-2xl border border-[#e0e0e0] bg-[#f8f9ff] px-4 py-3.5 text-[15px] text-[#333] outline-none transition focus:border-[#5c6bc0] focus:ring-2 focus:ring-[#5c6bc0]/20"
          />
          {err && (
            <p className="text-[13px] font-semibold text-red-500">{err}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f9a825] py-3.5 text-[15px] font-bold text-[#1a237e] transition hover:bg-[#f57f17] disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : "🔑"}
            {busy ? "Mengesahkan..." : "Log Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-[#999]">
          Akses terhad — data murid dilindungi
        </p>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useAuth();
  const title = useTitle();

  // Full-screen guest panel — tanpa sidebar/topbar
  if (!loading && !session) return <GuestLoginPanel />;

  return (
    <div className="relative flex h-screen overflow-hidden bg-paper">
      {/* Desktop sidebar */}
      <div className="relative z-10 hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-navy-900/50 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} title={title} />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 p-4 lg:px-5 lg:py-4">
            {loading ? null : <Outlet />}
          </div>
          <ActionBar />
          <Footer />
        </main>
      </div>
    </div>
  );
}
