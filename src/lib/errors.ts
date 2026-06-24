const DB_ERROR_MAP: [string, string][] = [
  ["violates foreign key", "Rekod berkaitan tidak wujud. Sila semak data."],
  ["violates unique", "Rekod ini sudah wujud."],
  ["violates not-null", "Sila isi semua medan yang diperlukan."],
  ["violates row-level security", "Anda tidak dibenarkan untuk tindakan ini."],
  ["permission denied", "Akses ditolak."],
  ["invalid input syntax", "Format data tidak sah. Sila semak input."],
  ["does not exist", "Rekod tidak dijumpai."],
];

export function friendlyError(e: unknown): string {
  if (import.meta.env.DEV) {
    console.error("[DB Error]", e);
  }
  const msg = (e as Error)?.message ?? String(e);
  for (const [pattern, friendly] of DB_ERROR_MAP) {
    if (msg.toLowerCase().includes(pattern)) return friendly;
  }
  return "Ralat berlaku. Sila cuba lagi atau hubungi admin.";
}
