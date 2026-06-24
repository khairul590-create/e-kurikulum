import { Menu, ChevronDown } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useYear } from "@/providers/YearProvider";
import { initials } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { SchoolSettings } from "@/types/db";

export function Topbar({ onMenu, title }: { onMenu: () => void; title: string }) {
  const { profile, signOut } = useAuth();
  const { yearId, setYearId, years } = useYear();
  const sekolah = useQuery({
    queryKey: ["school_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("school_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? null) as SchoolSettings | null;
    },
  });
  const nama = sekolah.data?.nama_sekolah ?? "SK Darau";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-gradient-to-r from-[#1a237e] via-[#283593] to-[#3949ab] px-4 text-white lg:px-6">
      <button
        onClick={onMenu}
        className="grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-extrabold tracking-tight lg:text-lg">{title}</h1>
        <p className="hidden truncate font-display text-[11px] font-semibold italic text-gold sm:block">{nama}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 lg:gap-3">
        {/* Pemilih sesi (tapis data UASA) */}
        <select
          value={yearId ?? ""}
          onChange={(e) => setYearId(e.target.value || null)}
          title="Tapis analitik UASA mengikut sesi"
          className="hidden h-9 cursor-pointer rounded-xl border border-white/25 bg-white/15 px-3 text-sm font-medium text-white outline-none [&>option]:text-ink sm:block"
        >
          <option value="">Semua Sesi</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.label}
            </option>
          ))}
        </select>

        {/* Profile chip */}
        <Dropdown.Root>
          <Dropdown.Trigger className="flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-1.5 outline-none transition hover:bg-white/25">
            <div className="grid size-9 place-items-center rounded-full bg-white/25 text-sm font-semibold text-white">
              {initials(profile?.nama)}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-[12px] font-semibold text-white">{profile?.nama ?? "Pengguna"}</p>
              <p className="text-[10px] text-white/85">{profile?.jawatan ?? "Guru"}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#69f0ae]" />
                <span className="text-[9px] text-[#69f0ae]">Online</span>
              </div>
            </div>
            <ChevronDown className="hidden size-4 text-white/70 sm:block" />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content
              align="end"
              sideOffset={8}
              className="z-50 w-52 rounded-xl border border-line bg-white p-1.5 shadow-pop animate-fade-in"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink">{profile?.nama}</p>
                <p className="text-xs text-ink-muted">{profile?.email}</p>
              </div>
              <Dropdown.Separator className="my-1 h-px bg-line" />
              <Dropdown.Item asChild>
                <a
                  href="/tetapan"
                  className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-ink outline-none hover:bg-slate-100"
                >
                  Profil & Tetapan
                </a>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => signOut()}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-danger outline-none hover:bg-red-50"
              >
                Log Keluar
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </div>
    </header>
  );
}
