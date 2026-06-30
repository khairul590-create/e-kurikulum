// Import Jadual Waktu Guru dari JSON (aSc Timetables) ke Supabase `jadual_waktu`.
//
// Dua mod:
//   node scripts/import-jadual.cjs            # insert LIVE (perlu DB_URL dlm .env.local)
//   node scripts/import-jadual.cjs --dry-run  # parse + papar ringkasan, takda tulis DB
//   node scripts/import-jadual.cjs --sql      # jana fail .sql utk Supabase SQL Editor
//
// Idempotent: padam slot sesi=pagi (tahun semasa) dahulu, insert balik.
// Auto-cipta guru (profiles), subjek (subjects), kelas (classes) yang belum wujud.
//
// Keputusan reka bentuk:
//   - Kelas gabung "6 APL/6 UNK" + "PRA"  -> kelas_id NULL, label penuh dlm `bilik`.
//   - Kelas tunggal "6 APL"               -> resolve ke classes (cipta jika tiada).
//   - Slot bukan-kelas (P, DATA, OB, ...) -> kelas_id NULL, subject_id set.
//   - nota sumber (cth "ALDEY") dibuang (bukan data jadual).

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "data", "jadual_guru_pagi_2026.json");
const SQL_OUT = path.join(__dirname, "data", "jadual_import.sql");

const DRY = process.argv.includes("--dry-run");
const SQL = process.argv.includes("--sql");
const SESI = "pagi";

const HARI_NUM = { ISNIN: 1, SELASA: 2, RABU: 3, KHAMIS: 4, JUMAAT: 5 };
const STREAM = { APL: "Aplikasi", ASP: "Aspirasi", REV: "Revolusi", DED: "Dedikasi", UNK: "Unik" };

// Warna subjek baru (kod sedia ada dlm DB tak ditimpa).
const WARNA = {
  P: "#64748B", PAI: "#0D9488", TSMK: "#0F766E", BA: "#7C3AED", BM: "#2563EB",
  BI: "#0EA5E9", MT: "#16A34A", SN: "#F59E0B", SJ: "#8B5CF6", PM: "#DB2777",
  MZ: "#14B8A6", PJ: "#EF4444", PK: "#F97316", PSV: "#A855F7", RBT: "#6366F1",
  BKD: "#CA8A04", DATA: "#475569", OB: "#0891B2", PPPSS: "#9333EA",
  GMLM: "#E11D48", PRA: "#F43F5E",
};

// ---------- env ----------
function loadDbUrl() {
  if (process.env.DB_URL) return process.env.DB_URL;
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const line = fs.readFileSync(envPath, "utf8").split("\n").find((l) => l.trim().startsWith("DB_URL="));
    if (line) return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

// ---------- helpers ----------
const pad2 = (h) => (h.length === 1 ? "0" + h : h);
// "8:50-9:50" -> { mula:"08:50:00", akhir:"09:50:00" }
function parseMasa(masa) {
  const [a, b] = masa.split("-");
  const norm = (t) => {
    const [h, m] = t.trim().split(":");
    return `${pad2(h)}:${m}:00`;
  };
  return { mula: norm(a), akhir: norm(b) };
}
// "6 APL" -> { tahun:6, nama:"6 Aplikasi" } ; null jika tak padan corak
function expandSatu(raw) {
  const m = String(raw).trim().match(/^(\d)\s+([A-Z]+)$/);
  if (!m || !STREAM[m[2]]) return null;
  return { tahun: Number(m[1]), nama: `${m[1]} ${STREAM[m[2]]}` };
}
// Pulang { kelasNama, bilik } ikut keputusan reka bentuk.
function resolveKelas(raw) {
  if (raw == null) return { kelasNama: null, bilik: null };
  const s = String(raw).trim();
  if (s.toUpperCase() === "PRA") return { kelasNama: null, bilik: "PRA" };
  if (s.includes("/")) {
    const parts = s.split("/").map((p) => {
      const e = expandSatu(p);
      return e ? e.nama : p.trim();
    });
    return { kelasNama: null, bilik: parts.join(" / ") };
  }
  const e = expandSatu(s);
  if (!e) return { kelasNama: null, bilik: s }; // corak luar jangka -> simpan mentah
  return { kelasNama: e.nama, bilik: null };
}

// ---------- parse ----------
const data = JSON.parse(fs.readFileSync(SRC, "utf8"));

const subjects = new Map();           // kod -> {kod, nama, warna}
for (const [kod, nama] of Object.entries(data.kod_subjek || {})) {
  subjects.set(kod, { kod, nama, warna: WARNA[kod] || "#2563EB" });
}
const classes = new Map();            // nama -> tahun
const teachers = new Set();
const rows = [];                      // {guru, hari, mula, akhir, kod, kelasNama, bilik}

for (const g of data.guru || []) {
  teachers.add(g.nama);
  for (const [hariNama, slots] of Object.entries(g.jadual || {})) {
    const hari = HARI_NUM[hariNama];
    if (!hari) continue;
    for (const s of slots) {
      const { mula, akhir } = parseMasa(s.masa);
      const { kelasNama, bilik } = resolveKelas(s.kelas);
      if (kelasNama) classes.set(kelasNama, expandSatu(kelasNama.replace(/(\d) (\w+)/, "$1 $2")) ? Number(kelasNama[0]) : null);
      if (!subjects.has(s.subjek)) subjects.set(s.subjek, { kod: s.subjek, nama: s.subjek, warna: "#2563EB" });
      rows.push({ guru: g.nama, hari, mula, akhir, kod: s.subjek, kelasNama, bilik });
    }
  }
}
// tahun kelas dari digit pertama nama
for (const nama of classes.keys()) classes.set(nama, Number(nama[0]));

console.log(`📄 ${path.basename(SRC)}`);
console.log(`   Guru: ${teachers.size} | Subjek: ${subjects.size} | Kelas: ${classes.size} | Slot: ${rows.length}`);

if (DRY) {
  console.log("\n🧪 DRY RUN — takda apa di-insert.");
  console.log("   Kelas:", [...classes.keys()].sort().join(", "));
  console.log("   Subjek:", [...subjects.keys()].join(", "));
  console.log("   Contoh slot:", JSON.stringify(rows.slice(0, 4), null, 2));
  const gabung = rows.filter((r) => r.bilik).slice(0, 6).map((r) => `${r.guru.split(" ")[0]} ${r.kod} [${r.bilik}]`);
  console.log("   Contoh bilik/gabung:", gabung.join(" | "));
  process.exit(0);
}

// ---------- SQL escape ----------
const q = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const YR = "(select id from academic_years where is_current limit 1)";

function buildSql() {
  const L = [];
  L.push("-- Auto-jana: import jadual waktu guru (sesi pagi). Selamat diulang.");
  L.push("-- Jalankan di Supabase -> SQL Editor.");
  L.push("begin;");
  L.push("");
  L.push("-- 1) Subjek (kekalkan kod sedia ada; cipta yg tiada)");
  for (const s of subjects.values()) {
    L.push(`insert into subjects (kod, nama, warna) values (${q(s.kod)}, ${q(s.nama)}, ${q(s.warna)}) on conflict (kod) do nothing;`);
  }
  L.push("");
  L.push("-- 2) Kelas (cipta jika tiada)");
  for (const [nama, tahun] of classes) {
    L.push(`insert into classes (nama, tahun) select ${q(nama)}, ${tahun} where not exists (select 1 from classes where nama=${q(nama)});`);
  }
  L.push("");
  L.push("-- 3) Guru / profil (cipta jika tiada)");
  for (const nama of teachers) {
    L.push(`insert into profiles (nama, role) select ${q(nama)}, 'guru' where not exists (select 1 from profiles where nama=${q(nama)});`);
  }
  L.push("");
  L.push("-- 4) Buang slot pagi tahun semasa (idempotent)");
  L.push(`delete from jadual_waktu where sesi=${q(SESI)} and year_id is not distinct from ${YR};`);
  L.push("");
  L.push("-- 5) Insert slot");
  for (const r of rows) {
    const kelas = r.kelasNama ? `(select id from classes where nama=${q(r.kelasNama)} limit 1)` : "NULL";
    const subj = `(select id from subjects where kod=${q(r.kod)} limit 1)`;
    const guru = `(select id from profiles where nama=${q(r.guru)} order by created_at limit 1)`;
    L.push(
      `insert into jadual_waktu (guru_id, hari, masa_mula, masa_akhir, kelas_id, subject_id, bilik, sesi, year_id) ` +
      `values (${guru}, ${r.hari}, ${q(r.mula)}, ${q(r.akhir)}, ${kelas}, ${subj}, ${r.bilik ? q(r.bilik) : "NULL"}, ${q(SESI)}, ${YR});`
    );
  }
  L.push("");
  L.push("commit;");
  return L.join("\n");
}

if (SQL) {
  fs.writeFileSync(SQL_OUT, buildSql());
  console.log(`\n✅ SQL dijana: ${path.relative(process.cwd(), SQL_OUT)}`);
  console.log("   Paste isi fail ke Supabase -> SQL Editor -> Run.");
  process.exit(0);
}

// ---------- LIVE insert (pg) ----------
(async () => {
  const dbUrl = loadDbUrl();
  if (!dbUrl) {
    console.error("\n❌ DB_URL tiada dlm .env.local. Pilihan:");
    console.error("   a) Letak DB_URL=postgresql://postgres:PWD@db.<ref>.supabase.co:5432/postgres");
    console.error("   b) Jana SQL: node scripts/import-jadual.cjs --sql  (paste ke Supabase SQL Editor)");
    process.exit(1);
  }
  const { Client } = require("pg");
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("\n🔌 Connected.");
  try {
    await client.query("begin");

    for (const s of subjects.values()) {
      await client.query("insert into subjects (kod,nama,warna) values ($1,$2,$3) on conflict (kod) do nothing", [s.kod, s.nama, s.warna]);
    }
    const classId = new Map();
    for (const [nama, tahun] of classes) {
      let r = await client.query("select id from classes where nama=$1 limit 1", [nama]);
      if (!r.rows.length) r = await client.query("insert into classes (nama,tahun) values ($1,$2) returning id", [nama, tahun]);
      classId.set(nama, r.rows[0].id);
    }
    const guruId = new Map();
    for (const nama of teachers) {
      let r = await client.query("select id from profiles where nama=$1 order by created_at limit 1", [nama]);
      if (!r.rows.length) r = await client.query("insert into profiles (nama,role) values ($1,'guru') returning id", [nama]);
      guruId.set(nama, r.rows[0].id);
    }
    const subjId = new Map();
    for (const kod of subjects.keys()) {
      const r = await client.query("select id from subjects where kod=$1 limit 1", [kod]);
      subjId.set(kod, r.rows[0].id);
    }
    const yr = await client.query("select id from academic_years where is_current limit 1");
    const yearId = yr.rows[0]?.id ?? null;

    await client.query(
      "delete from jadual_waktu where sesi=$1 and year_id is not distinct from $2",
      [SESI, yearId],
    );

    let n = 0;
    for (const r of rows) {
      await client.query(
        `insert into jadual_waktu (guru_id,hari,masa_mula,masa_akhir,kelas_id,subject_id,bilik,sesi,year_id)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [guruId.get(r.guru), r.hari, r.mula, r.akhir, r.kelasNama ? classId.get(r.kelasNama) : null, subjId.get(r.kod), r.bilik, SESI, yearId],
      );
      n++;
    }

    await client.query("commit");
    console.log(`\n✅ Selesai. Guru ${teachers.size}, Subjek ${subjects.size}, Kelas ${classes.size}, Slot ${n}.`);
  } catch (e) {
    await client.query("rollback");
    console.error("\n❌ RALAT — rollback:", e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
