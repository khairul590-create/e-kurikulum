-- ============================================================
-- Barisan pentadbiran sekolah pada school_settings (FK ke profiles).
-- RLS sedia ada (read authenticated + admin_all) cukup — tiada policy baru.
-- ============================================================

alter table school_settings add column if not exists guru_besar_id uuid references profiles(id) on delete set null;
alter table school_settings add column if not exists pk1_id        uuid references profiles(id) on delete set null;
alter table school_settings add column if not exists pk_hem_id     uuid references profiles(id) on delete set null;
alter table school_settings add column if not exists pk_koko_id    uuid references profiles(id) on delete set null;
alter table school_settings add column if not exists pk_petang_id  uuid references profiles(id) on delete set null;
