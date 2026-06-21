import { LifeBuoy, BookOpen, ClipboardList, Users, Mail } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

const FAQ = [
  {
    icon: ClipboardList,
    q: "Bagaimana menyediakan RPH?",
    a: "Pergi ke menu RPH > Tambah RPH. Isi tajuk, mata pelajaran, kelas, tarikh dan status. RPH yang anda cipta hanya boleh dikemaskini oleh anda.",
  },
  {
    icon: Users,
    q: "Bagaimana memasukkan markah murid?",
    a: "Menu Pentaksiran > pilih pentaksiran > klik 'Markah'. Masukkan markah 0–100 bagi setiap murid; tahap pencapaian dijana automatik.",
  },
  {
    icon: BookOpen,
    q: "Siapa boleh urus data murid & guru?",
    a: "Hanya Pentadbir (admin) boleh menambah/mengemaskini murid, guru, kelas, subjek dan tetapan sekolah. Guru boleh melihat semua data.",
  },
];

export default function BantuanPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Bantuan</h1>
        <p className="text-sm text-ink-muted">Panduan ringkas penggunaan sistem E-Kurikulum</p>
      </div>

      <Card className="bg-gradient-to-br from-navy-700 to-navy-900 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-white/10">
            <LifeBuoy className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Perlukan bantuan lanjut?</h2>
            <p className="text-sm text-white/70">Hubungi Guru Penolong Kanan Kurikulum atau pentadbir sistem sekolah.</p>
          </div>
          <a
            href="mailto:admin@kurikulum.test"
            className="ml-auto hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-navy-800 sm:flex"
          >
            <Mail className="size-4" /> Hubungi
          </a>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FAQ.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.q}>
              <CardBody>
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 font-semibold text-ink">{f.q}</h3>
                <p className="mt-1 text-sm text-ink-muted">{f.a}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
