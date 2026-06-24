import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { navGroups } from "@/config/nav";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { SchoolSettings } from "@/types/db";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useAuth();
  const sekolah = useQuery({
    queryKey: ["school_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("school_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? null) as SchoolSettings | null;
    },
  });
  const nama = sekolah.data?.nama_sekolah ?? "SK Darau";
  const sub = sekolah.data?.subtajuk ?? sekolah.data?.alamat ?? "Kota Kinabalu, Sabah";

  return (
    <aside className="flex h-full w-[240px] flex-col overflow-y-auto bg-gradient-to-b from-[#1a237e] via-[#283593] to-[#3949ab] pb-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-white/15 px-4 py-4">
        <div className="grid size-[44px] shrink-0 place-items-center rounded-full bg-white text-2xl">🎓</div>
        <div className="leading-tight text-white">
          <div className="text-[13px] font-bold uppercase">{nama}</div>
          <div className="text-[10px] opacity-75">{sub}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-1">
        {navGroups.map((g, gi) => {
          const items = g.items.filter((i) => !i.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={gi}>
              <div className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[1.2px] text-white/50">
                {g.title ?? "Dashboard"}
              </div>
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
                        "flex items-center gap-2.5 border-l-[3px] px-4 py-2.5 text-[14px] font-medium transition",
                        isActive
                          ? "border-gold bg-white/[0.16] text-white"
                          : "border-transparent text-white/85 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    <Icon className="size-[17px] shrink-0" />
                    <span className="truncate">{i.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Brand badge */}
      <div className="mt-auto border-t border-white/15 px-4 pt-3.5">
        <div className="rounded-[10px] bg-gradient-to-br from-[#f9a825] to-[#ff6d00] px-3 py-2.5 text-center text-white">
          <div className="text-sm font-extrabold tracking-wide">🌟 SMART KURIKULUM</div>
          <div className="text-[9px] opacity-90">Excellence Together</div>
        </div>
      </div>
    </aside>
  );
}
