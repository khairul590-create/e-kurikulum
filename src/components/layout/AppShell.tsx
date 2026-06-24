import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

// Emel admin disimpan di bahagian ini — tidak dipaparkan kepada pengguna
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
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-pop">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#3949ab] text-3xl shadow-lg">
            🔐
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">Masukkan Kata Laluan</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Kata laluan diperlukan untuk papar data dan mengedit rekod.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-ink">Kata Laluan</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              autoFocus
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          {err && <p className="text-sm font-semibold text-danger">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#3949ab] py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy ? "Mengesahkan..." : "Masuk →"}
          </button>
        </form>
        <p className="mt-5 text-center text-[12px] text-ink-soft">
          E-Kurikulum SK Darau · Sistem Dalaman Sekolah
        </p>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useAuth();
  const title = useTitle();

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
          <div className="flex flex-1 flex-col p-4 lg:px-5 lg:py-4">
            {loading ? null : session ? <Outlet /> : <GuestLoginPanel />}
          </div>
          {session && <ActionBar />}
          <Footer />
        </main>
      </div>
    </div>
  );
}
