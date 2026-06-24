import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AcademicYear } from "@/types/db";

interface YearCtx {
  yearId: string | null; // null = semua sesi
  setYearId: (id: string | null) => void;
  years: AcademicYear[];
  label: string;
}

const Ctx = createContext<YearCtx>({ yearId: null, setYearId: () => {}, years: [], label: "Semua Sesi" });

export function YearProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["academic_years", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("academic_years").select("*").order("label", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AcademicYear[];
    },
  });
  const years = data ?? [];
  const [yearId, setYearId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Default ke sesi semasa selepas senarai dimuat (sehingga user pilih sendiri)
  useEffect(() => {
    if (!touched && years.length > 0) {
      const cur = years.find((y) => y.is_current);
      if (cur) setYearId(cur.id);
    }
  }, [years, touched]);

  const label = yearId ? (years.find((y) => y.id === yearId)?.label ?? "Sesi") : "Semua Sesi";

  return (
    <Ctx.Provider value={{ yearId, setYearId: (id) => { setTouched(true); setYearId(id); }, years, label }}>
      {children}
    </Ctx.Provider>
  );
}

export function useYear() {
  return useContext(Ctx);
}
