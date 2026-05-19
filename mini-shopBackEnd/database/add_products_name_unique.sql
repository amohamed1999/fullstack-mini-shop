-- Run once in Supabase SQL Editor if products table already exists without unique name
alter table products add constraint products_name_key unique (name);
