// Import murid dari fail Excel "SENARAI MURID tahun N.xlsx" ke Supabase.
//
// Guna pg direct (bypass RLS — anon key tak boleh insert students).
// Set DB_URL dalam .env.local:
//   DB_URL=postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres
//
// Jalankan:
//   node scripts/import-students.cjs            # import semua fail default
//   node scripts/import-students.cjs --dry-run  # parse + papar je, takda insert
//   node scripts/import-students.cjs "file1.xlsx" "file2.xlsx"
//
// Idempotent: upsert ikut no_sijil_lahir (NO. PENGENALAN). Boleh ulang dengan selamat.

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { Client } = require("pg");

const SRC_DIR = "/Users/khairulazwani/Desktop/MACBOOK/SENARAI NAMA MURID/";
const DEFAULT_FILES = [
  "SENARAI MURID tahun 1.xlsx",
  "SENARAI MURID tahun 2.xlsx",
  "SENARAI MURID tahun 3.xlsx",
  "SENARAI MURID tahun 4.xlsx",
  "SENARAI MURID Tahun 5.xlsx",
];

const DRY = process.argv.includes("--dry-run");
const fileArgs = process.argv.slice(2).filter((a) => a.endsWith(".xlsx"));
const files = (fileArgs.length ? fileArgs : DEFAULT_FILES).map((f) =>
  path.isAbsolute(f) ? f : path.join(SRC_DIR, f),
);

// ---------- env ----------
function loadDbUrl() {
  if (process.env.DB_URL) return process.env.DB_URL;
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const line = fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith("DB_URL="));
    if (line) return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

// ---------- helpers ----------
const titleCase = (s) =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// "D1 APLIKASI" -> { tahun:1, nama:"1 Aplikasi" }
function parseKelas(raw) {
  const s = String(raw).trim();
  const m = s.match(/^D?\s*(\d)\s+(.+)$/i);
  if (!m) return null;
  return { tahun: Number(m[1]), nama: `${m[1]} ${titleCase(m[2].trim())}` };
}

// IC/MyKid: kekal string, pad 0 di depan jika hilang (Excel buang leading zero)
function normSijil(v) {
  if (v === null || v === undefined || v === "") return null;
  let s = String(v).trim().replace(/\s|-/g, "");
  if (/^\d+$/.test(s) && s.length === 11) s = "0" + s; // MyKid 12 digit
  return s || null;
}

function findHeaderRow(rows) {
  return rows.findIndex((r) =>
    r.some((c) => String(c).toUpperCase().includes("PENGENALAN")),
  );
}

function colIndex(header, ...needles) {
  return header.findIndex((c) =>
    needles.some((n) => String(c).toUpperCase().includes(n)),
  );
}

// ---------- parse ----------
function parseFile(file) {
  const wb = XLSX.readFile(file);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    header: 1,
    raw: false,
    defval: "",
  });
  const hi = findHeaderRow(rows);
  if (hi < 0) throw new Error(`Header tak jumpa dalam ${path.basename(file)}`);
  const H = rows[hi];

  const iNama = colIndex(H, "NAMA");
  const iSijil = colIndex(H, "PENGENALAN");
  const iKelas = colIndex(H, "KELAS", "INSTITUSI");
  const iJantina = colIndex(H, "JANTINA");

  if (iJantina < 0)
    throw new Error(
      `Kolum JANTINA tiada dalam ${path.basename(file)}. ` +
        `Tambah kolum "JANTINA" (isi L/P) dahulu.`,
    );

  const out = [];
  const bad = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const nama = String(r[iNama] || "").trim();
    if (!nama) continue; // baris kosong
    const kelas = parseKelas(r[iKelas]);
    const jantina = String(r[iJantina] || "").trim().toUpperCase();

    if (jantina !== "L" && jantina !== "P") {
      bad.push({ row: i + 1, nama, jantina: r[iJantina] });
      continue;
    }
    if (!kelas) bad.push({ row: i + 1, nama, kelas: r[iKelas], note: "kelas invalid" });

    out.push({
      nama,
      no_sijil_lahir: normSijil(r[iSijil]),
      jantina,
      kelas_nama: kelas ? kelas.nama : null,
      tahun: kelas ? kelas.tahun : null,
    });
  }
  return { students: out, bad, file: path.basename(file) };
}

// ---------- main ----------
(async () => {
  let students = [];
  const allBad = [];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error(`⚠️  Fail tiada: ${f}`);
      continue;
    }
    const { students: s, bad, file } = parseFile(f);
    console.log(`📄 ${file}: ${s.length} murid${bad.length ? `, ${bad.length} bermasalah` : ""}`);
    students = students.concat(s);
    bad.forEach((b) => allBad.push({ file, ...b }));
  }

  // kelas unik
  const kelasMap = new Map(); // nama -> tahun
  students.forEach((s) => {
    if (s.kelas_nama && !kelasMap.has(s.kelas_nama)) kelasMap.set(s.kelas_nama, s.tahun);
  });

  console.log(`\n📊 Jumlah: ${students.length} murid, ${kelasMap.size} kelas`);
  if (allBad.length) {
    console.log(`\n⚠️  ${allBad.length} baris perlu semak (jantina/kelas invalid):`);
    allBad.slice(0, 30).forEach((b) =>
      console.log(`   [${b.file} baris ${b.row}] ${b.nama} — ${b.note || "jantina=" + JSON.stringify(b.jantina)}`),
    );
    if (allBad.length > 30) console.log(`   … +${allBad.length - 30} lagi`);
  }

  if (DRY) {
    console.log("\n🧪 DRY RUN — takda apa-apa di-insert.");
    console.log("Contoh kelas:", [...kelasMap.entries()].slice(0, 8).map(([n, t]) => `${n}(t${t})`).join(", "));
    console.log("Contoh murid:", JSON.stringify(students.slice(0, 3), null, 2));
    return;
  }

  const dbUrl = loadDbUrl();
  if (!dbUrl) {
    console.error("\n❌ DB_URL tiada. Letak dalam .env.local:\n   DB_URL=postgresql://postgres:PWD@db.<ref>.supabase.co:5432/postgres");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("\n🔌 Connected.");

  try {
    await client.query("begin");

    // 1) Kelas — upsert ikut (nama). Perlu unique constraint; kalau takda, fallback select.
    const kelasId = new Map();
    for (const [nama, tahun] of kelasMap) {
      const sel = await client.query("select id from classes where nama=$1 limit 1", [nama]);
      if (sel.rows.length) {
        kelasId.set(nama, sel.rows[0].id);
      } else {
        const ins = await client.query(
          "insert into classes (nama, tahun) values ($1,$2) returning id",
          [nama, tahun],
        );
        kelasId.set(nama, ins.rows[0].id);
      }
    }
    console.log(`✅ Kelas siap: ${kelasId.size}`);

    // 2) Murid — upsert ikut no_sijil_lahir bila ada; insert biasa bila null.
    let ins = 0, upd = 0, skip = 0;
    for (const s of students) {
      const kid = s.kelas_nama ? kelasId.get(s.kelas_nama) : null;
      if (s.no_sijil_lahir) {
        const r = await client.query(
          `insert into students (nama, no_sijil_lahir, jantina, kelas_id)
           values ($1,$2,$3,$4)
           on conflict (no_sijil_lahir) do update
             set nama=excluded.nama, jantina=excluded.jantina, kelas_id=excluded.kelas_id
           returning (xmax=0) as inserted`,
          [s.nama, s.no_sijil_lahir, s.jantina, kid],
        );
        r.rows[0].inserted ? ins++ : upd++;
      } else {
        // tiada sijil — elak duplikat ikut nama+kelas
        const dup = await client.query(
          "select 1 from students where nama=$1 and kelas_id is not distinct from $2 limit 1",
          [s.nama, kid],
        );
        if (dup.rows.length) { skip++; continue; }
        await client.query(
          "insert into students (nama, jantina, kelas_id) values ($1,$2,$3)",
          [s.nama, s.jantina, kid],
        );
        ins++;
      }
    }

    await client.query("commit");
    console.log(`\n✅ Selesai. Insert: ${ins}, Update: ${upd}, Skip: ${skip}`);
  } catch (e) {
    await client.query("rollback");
    console.error("\n❌ RALAT — rollback semua:", e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
