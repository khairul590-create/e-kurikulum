import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { initials } from "@/lib/utils";
import { useList } from "@/lib/crud";
import type { AcademicYear } from "@/types/db";

export function Topbar({ onMenu, title }: { onMenu: () => void; title: string }) {
  const { profile, signOut } = useAuth();
  const years = useList<AcademicYear>("academic_years", { orderBy: "label" });
  const current = years.data?.find((y) => y.is_current);
  const [year, setYear] = useState<string>();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b-2 border-line bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenu}
        className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-slate-100 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="text-base font-semibold text-ink lg:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-2 lg:gap-3">
        {/* Year selector */}
        <select
          value={year ?? current?.label ?? ""}
          onChange={(e) => setYear(e.target.value)}
          className="hidden h-9 cursor-pointer rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-brand sm:block"
        >
          {(years.data ?? []).map((y) => (
            <option key={y.id} value={y.label}>
              {y.label}
            </option>
          ))}
        </select>

        {/* Notifications */}
        <button className="relative grid size-9 place-items-center rounded-xl text-ink-muted hover:bg-slate-100">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Profile */}
        <Dropdown.Root>
          <Dropdown.Trigger className="flex items-center gap-2 rounded-xl px-1.5 py-1 outline-none hover:bg-slate-100">
            <div className="grid size-9 place-items-center rounded-full bg-navy-800 text-sm font-semibold text-white">
              {initials(profile?.nama)}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-semibold text-ink">{profile?.nama ?? "Pengguna"}</p>
              <p className="text-[11px] text-ink-muted">{profile?.jawatan ?? "Guru"}</p>
            </div>
            <ChevronDown className="hidden size-4 text-ink-soft sm:block" />
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
