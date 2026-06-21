import { NavLink } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { navGroups } from "@/config/nav";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin, signOut, profile } = useAuth();

  return (
    <aside className="flex h-full w-[260px] flex-col bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-11 shrink-0 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-sun to-sun-deep text-ink shadow-sun">
          <GraduationCap className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-black">SK Darau</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sun">Kota Kinabalu</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((g, gi) => {
          const items = g.items.filter((i) => !i.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={gi}>
              {g.title && (
                <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/45">
                  {g.title}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((i) => {
                  const Icon = i.icon;
                  return (
                    <NavLink
                      key={i.to}
                      to={i.to}
                      end={i.to === "/"}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                          isActive
                            ? "bg-sun text-ink shadow-sun"
                            : "text-white/75 hover:bg-white/15 hover:text-white",
                        )
                      }
                    >
                      <Icon className="size-[18px] shrink-0" />
                      <span className="truncate">{i.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-[18px]" />
          Log Keluar
        </button>
        <p className="px-3 pt-2 text-[11px] text-white/40">{profile?.email}</p>
      </div>
    </aside>
  );
}
