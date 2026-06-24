import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import type {
  UasaGredOverall,
  UasaGredSubjek,
  UasaPassSubjek,
  UasaCemerlangMurid,
} from "@/types/db";

export function useUasa() {
  const overall = useQuery({ queryKey: ["v_uasa_gred_overall"], queryFn: () => many<UasaGredOverall>("v_uasa_gred_overall") });
  const subjek = useQuery({ queryKey: ["v_uasa_gred_subjek"], queryFn: () => many<UasaGredSubjek>("v_uasa_gred_subjek") });
  const pass = useQuery({ queryKey: ["v_uasa_pass_subjek"], queryFn: () => many<UasaPassSubjek>("v_uasa_pass_subjek") });
  const cemerlang = useQuery({ queryKey: ["v_uasa_cemerlang_murid"], queryFn: () => many<UasaCemerlangMurid>("v_uasa_cemerlang_murid", "purata", false, 15) });
  return { overall, subjek, pass, cemerlang };
}
