import { Panel, PanelHead, PanelBody, PageTitle, InfoNote } from "@/components/panel/Panel";

const FAQ = [
  {
    q: "Apakah perbezaan UASA dan PBD?",
    a: "UASA ialah ujian sumatif akhir sesi (Tahun 4–6) dilaporkan dalam gred A–F. PBD ialah pentaksiran berterusan sepanjang tahun (Tahun 1–6) dilaporkan dalam TP1–TP6.",
  },
  {
    q: "Berapa kali PBD dilaporkan setahun?",
    a: "Sekurang-kurangnya 2 kali setahun kepada murid dan ibu bapa.",
  },
  {
    q: "Bagaimana memasukkan markah UASA?",
    a: "Menu Analisis UASA > Kemasukan Markah. Pilih kelas & subjek, masukkan markah 0–100 bagi setiap murid; gred A–F dijana automatik.",
  },
  {
    q: "Siapa boleh urus data & tetapan?",
    a: "Hanya Pentadbir (admin) boleh menambah/mengemaskini data & tetapan sekolah. Ketua panitia boleh urus ruang Fail Panitia masing-masing.",
  },
];

export default function BantuanPage() {
  return (
    <div>
      <PageTitle icon="❓" title="Bantuan" subtitle="Panduan penggunaan sistem & sokongan" />

      <InfoNote>
        ℹ️ Untuk bantuan teknikal, hubungi penyelaras ICT sekolah atau rujuk manual pengguna sistem SMART KURIKULUM.
      </InfoNote>

      <Panel>
        <PanelHead variant="teal" icon="❓">Soalan Lazim</PanelHead>
        <PanelBody className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q}>
              <p className="text-[12px] font-bold text-ink">{f.q}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#666]">{f.a}</p>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
