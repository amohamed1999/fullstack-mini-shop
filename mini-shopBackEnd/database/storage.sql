-- ============================================================
-- Supabase Storage — Bucket & Policies
-- Run in Supabase SQL Editor
-- ============================================================

-- Create the products bucket (public read)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow anyone to read product images
create policy "products storage: public read"
  on storage.objects for select
  using (bucket_id = 'products');

-- Only admins may upload
create policy "products storage: admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and is_admin()
  );

-- Only admins may delete
create policy "products storage: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and is_admin()
  );
