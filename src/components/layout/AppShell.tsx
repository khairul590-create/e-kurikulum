import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ActionBar } from "./ActionBar";
import { Footer } from "./Footer";
import { navGroups } from "@/config/nav";
import { cn } from "@/lib/utils";

function useTitle() {
  const { pathname } = useLocation();
  // padanan paling spesifik dulu (path terpanjang)
  const items = navGroups.flatMap((g) => g.items).sort((a, b) => b.to.length - a.to.length);
  for (const i of items) {
    if (i.to === pathname || (i.to !== "/" && pathname.startsWith(i.to))) return i.label;
  }
  return "Dashboard Kurikulum";
}

export function AppShell() {
  const [open, setOpen] = useState(false);
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
          <div className="flex-1 p-4 lg:px-5 lg:py-4">
            <Outlet />
          </div>
          <ActionBar />
          <Footer />
        </main>
      </div>
    </div>
  );
}
