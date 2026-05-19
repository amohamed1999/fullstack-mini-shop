-- ============================================================
-- Fix profiles table when it was created without Mini Shop columns
-- Run in Supabase SQL Editor, then: npm run seed
-- ============================================================

alter table profiles add column if not exists name text;
alter table profiles add column if not exists role text default 'customer';
alter table profiles add column if not exists created_at timestamptz default now();

-- Backfill rows created before name existed
update profiles set name = 'User' where name is null;
update profiles set role = 'customer' where role is null;
update profiles set created_at = now() where created_at is null;

alter table profiles alter column name set not null;
alter table profiles alter column role set not null;
alter table profiles alter column created_at set not null;

do $$ begin
  alter table profiles add constraint profiles_role_check
    check (role in ('admin', 'customer'));
exception
  when duplicate_object then null;
end $$;
