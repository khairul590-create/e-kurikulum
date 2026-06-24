import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Panel, PanelHead, PanelBody, PageTitle, InfoNote } from "@/components/panel/Panel";
import { ColChart, GaugeRow, GaugeBox } from "@/components/panel/Bits";
import { Badge } from "@/components/ui/Badge";
import type { PbdTpTaburan, PbdTpSubjek } from "@/types/db";

const TP_GRAD = [
  "from-[#e53935] to-[#ef5350]",
  "from-[#ff6d00] to-[#ffa726]",
  "from-[#f9a825] to-[#ffca28]",
  "from-[#0fa968] to-[#66bb6a]",
  "from-[#1a73e8] to-[#42a5f5]",
  "from-[#7c4dff] to-[#ab47bc]",
];
const TP_LABEL = ["Tahu", "Faham", "Boleh Buat", "Beradab", "Terpuji", "Mithali"];

export default function PbdPage() {
  const taburan = useQuery({ queryKey: ["v_pbd_tp_taburan"], queryFn: () => many<PbdTpTaburan>("v_pbd_tp_taburan", "tp", true) });
  const subjek = useQuery({ queryKey: ["v_pbd_tp_subjek"], queryFn: () => many<PbdTpSubjek>("v_pbd_tp_subjek") });

  const rows = taburan.data ?? [];
  const cols = rows.map((t) => ({ label: <>TP{t.tp}<br />{TP_LABEL[t.tp - 1]}</>, value: t.bilangan, grad: TP_GRAD[t.tp - 1] ?? TP_GRAD[0] }));
  const total = rows.reduce((s, t) => s + t.bilangan, 0);
  const rendah = rows.filter((t) => t.tp <= 2).reduce((s, t) => s + t.bilangan, 0);
  const sederhana = rows.filter((t) => t.tp === 3 || t.tp === 4).reduce((s, t) => s + t.bilangan, 0);
  const tinggi = rows.filter((t) => t.tp >= 5).reduce((s, t) => s + t.bilangan, 0);
  const purataTp = total ? (rows.reduce((s, t) => s + t.tp * t.bilangan, 0) / total).toFixed(2) : "0";
  const pct = (v: number) => (total ? Math.round((100 * v) / total) : 0);

  return (
    <div>
      <PageTitle icon="📊" title="Analisis PBD (Tahap Penguasaan)" subtitle="Pentaksiran Bilik Darjah · Tahun 1–6 · Pelaporan TP1–TP6" />
      <InfoNote>
        ℹ️ PBD dilaksanakan berterusan melalui pemerhatian, lisan & penulisan. Dilaporkan kepada ibu bapa
        sekurang-kurangnya <b>2 kali setahun</b>. TP melihat perkembangan penguasaan, bukan membandingkan murid.
      </InfoNote>

      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[340px] flex-[1.35]">
          <PanelHead variant="green" icon="📊">Taburan Tahap Penguasaan Keseluruhan</PanelHead>
          <PanelBody>
            {cols.length > 0 ? <ColChart data={cols} height={220} /> : <p className="py-12 text-center text-[11px] text-ink-soft">Tiada data PBD.</p>}
          </PanelBody>
        </Panel>
        <div className="min-w-[280px] flex-1">
          <Panel>
            <PanelHead variant="blue" icon="🎯">Ringkasan Penguasaan</PanelHead>
            <PanelBody className="space-y-2.5">
              <GaugeRow>
                <GaugeBox tone="red" value={rendah} label={<>Rendah (TP1–2)<br />{pct(rendah)}%</>} />
                <GaugeBox tone="yellow" value={sederhana} label={<>Sederhana (TP3–4)<br />{pct(sederhana)}%</>} />
              </GaugeRow>
              <GaugeRow>
                <GaugeBox tone="green" value={tinggi} label={<>Tinggi (TP5–6)<br />{pct(tinggi)}%</>} />
                <GaugeBox tone="blue" value={purataTp} label={<>Purata TP<br />Sekolah</>} />
              </GaugeRow>
            </PanelBody>
          </Panel>
        </div>
      </div>

      <Panel className="mt-3.5">
        <PanelHead variant="purple" icon="📋">Tahap Penguasaan Mengikut Mata Pelajaran</PanelHead>
        <PanelBody className="px-3 py-2">
          <table className="data-table">
            <thead><tr><th>Mata Pelajaran</th><th>TP1</th><th>TP2</th><th>TP3</th><th>TP4</th><th>TP5</th><th>TP6</th><th>TP Purata</th></tr></thead>
            <tbody>
              {subjek.data?.map((r) => (
                <tr key={r.subject_id}>
                  <td className="font-medium text-ink">{r.subjek}</td>
                  <td>{r.tp1}</td><td>{r.tp2}</td><td>{r.tp3}</td><td>{r.tp4}</td><td>{r.tp5}</td><td>{r.tp6}</td>
                  <td><Badge tone="blue">TP{r.tp_purata}</Badge></td>
                </tr>
              ))}
              {(subjek.data ?? []).length === 0 && <tr><td colSpan={8} className="py-8 text-center text-ink-soft">Tiada data PBD.</td></tr>}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    </div>
  );
}
