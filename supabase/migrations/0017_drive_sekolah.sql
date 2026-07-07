-- ============================================================
-- Satu pautan Google Drive untuk seluruh sekolah (ganti ruang
-- fail berasingan per panitia). Admin sahaja edit (ikut RLS
-- school_settings sedia ada — admin_all policy).
-- ============================================================

alter table school_settings add column if not exists drive_url text;
