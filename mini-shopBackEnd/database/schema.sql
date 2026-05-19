-- ============================================================
-- Mini Shop — PostgreSQL Schema (Supabase)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'customer'
                check (role in ('admin', 'customer')),
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- ──────────────────────────────────────────────────────────────
-- categories
-- ──────────────────────────────────────────────────────────────
create table if not exists categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique
);

alter table categories enable row level security;

-- ──────────────────────────────────────────────────────────────
-- products
-- ──────────────────────────────────────────────────────────────
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  price        numeric(12, 2) not null check (price >= 0),
  image_url    text,
  category_id  uuid references categories(id) on delete set null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table products enable row level security;

-- ──────────────────────────────────────────────────────────────
-- orders
-- ──────────────────────────────────────────────────────────────
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount  numeric(12, 2) not null check (total_amount >= 0),
  created_at    timestamptz not null default now()
);

alter table orders enable row level security;

-- ──────────────────────────────────────────────────────────────
-- order_items
-- ──────────────────────────────────────────────────────────────
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(12, 2) not null check (unit_price >= 0)
);

alter table order_items enable row level security;

-- ──────────────────────────────────────────────────────────────
-- Helper: is the requesting user an admin?
-- ──────────────────────────────────────────────────────────────
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;
