-- ============================================================
-- Mini Shop — Reset database (run BEFORE schema.sql)
-- Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Storage policies (from storage.sql)
drop policy if exists "products storage: public read" on storage.objects;
drop policy if exists "products storage: admin upload" on storage.objects;
drop policy if exists "products storage: admin delete" on storage.objects;

-- Tables (child tables first)
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

-- Helper used by RLS and storage policies
drop function if exists is_admin();
