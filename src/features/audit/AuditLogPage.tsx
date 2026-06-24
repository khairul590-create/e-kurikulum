import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { formatTarikh } from "@/lib/utils";
import type { Activity } from "@/types/db";

const MODUL_TONE: Record<string, "blue" | "green" | "amber" | "purple" | "red" | "slate"> = {
  UASA: "blue",
  Tetapan: "amber",
  Akses: "red",
  Murid: "green",
  Guru: "purple",
  Subjek: "purple",
  Kelas: "teal" as "slate",
  Intervensi: "amber",
};

const MODUL_LIST = ["Semua", "UASA", "Tetapan", "Akses", "Murid", "Guru", "Subjek", "Kelas", "Intervensi", "Lain-lain"];

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [modul, setModul] = useState("Semua");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });

  const rows = (data ?? []).filter((r) => {
    const matchModul =
      modul === "Semua"
        ? true
        : modul === "Lain-lain"
        ? !MODUL_LIST.slice(1, -1).includes(r.modul ?? "")
        : r.modul === modul;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (r.action ?? "").toLowerCase().includes(q) ||
      (r.actor_nama ?? "").toLowerCase().includes(q) ||
      (r.detail ?? "").toLowerCase().includes(q) ||
      (r.modul ?? "").toLowerCase().includes(q);
    return matchModul && matchSearch;
  });

  return (
    <div className="space-y-4">
      <PageTitle
        icon="📋"
        title="Log Audit"
        subtitle="Rekod semua tindakan yang dilakukan dalam sistem"
        action={
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Muat Semula
          </button>
        }
      />

      <Panel>
        <PanelHead variant="indigo" icon="🔍">Cari & Tapis</PanelHead>
        <PanelBody>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tindakan, pengguna, butiran..."
                className="h-9 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-[13px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MODUL_LIST.map((m) => (
                <button
                  key={m}
                  onClick={() => setModul(m)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                    modul === m
                      ? "bg-[#1a237e] text-white"
                      : "border border-line bg-white text-ink-muted hover:bg-slate-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead variant="blue" icon="📋" tag={`${rows.length} rekod`}>
          Log Aktiviti
        </PanelHead>
        <PanelBody className="px-3 py-2">
          {isLoading ? (
            <PageLoader />
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-soft">Tiada rekod ditemui.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Masa</th>
                  <th>Pengguna</th>
                  <th>Tindakan</th>
                  <th>Modul</th>
                  <th>Butiran</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap text-[12px] text-ink-soft">
                      {formatTarikh(r.created_at)}
                    </td>
                    <td className="font-medium text-ink">
                      {r.actor_nama ?? <span className="text-ink-soft italic">Sistem</span>}
                    </td>
                    <td className="text-ink">{r.action}</td>
                    <td>
                      {r.modul ? (
                        <Badge tone={MODUL_TONE[r.modul] ?? "slate"}>{r.modul}</Badge>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate text-[12px] text-ink-muted">
                      {r.detail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PanelBody>
      </Panel>

      <p className="px-1 text-[11px] text-ink-soft">
        Papar 300 rekod terkini. Log disimpan dalam jadual <code>activities</code>.
      </p>
    </div>
  );
}
