import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/views";
import { useYear } from "@/providers/YearProvider";
import type {
  UasaGredOverall,
  UasaGredSubjek,
  UasaPassSubjek,
  UasaCemerlangMurid,
} from "@/types/db";

export function useUasa() {
  const { yearId } = useYear();
  const p = { p_year: yearId };
  const overall = useQuery({ queryKey: ["fn_uasa_gred_overall", yearId], queryFn: () => rpc<UasaGredOverall>("fn_uasa_gred_overall", p) });
  const subjek = useQuery({ queryKey: ["fn_uasa_gred_subjek", yearId], queryFn: () => rpc<UasaGredSubjek>("fn_uasa_gred_subjek", p) });
  const pass = useQuery({ queryKey: ["fn_uasa_pass_subjek", yearId], queryFn: () => rpc<UasaPassSubjek>("fn_uasa_pass_subjek", p) });
  const cemerlang = useQuery({ queryKey: ["fn_uasa_cemerlang", yearId], queryFn: () => rpc<UasaCemerlangMurid>("fn_uasa_cemerlang", p) });
  return { overall, subjek, pass, cemerlang };
}
