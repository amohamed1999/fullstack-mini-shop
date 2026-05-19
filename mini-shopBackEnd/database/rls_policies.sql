-- ============================================================
-- Mini Shop — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────

-- Users can read their own profile; admins can read all
create policy "profiles: users read own, admins read all"
  on profiles for select
  using (
    auth.uid() = id
    or is_admin()
  );

-- Only the service role can insert (done in registerUser)
create policy "profiles: service role insert"
  on profiles for insert
  with check (false); -- blocked for non-service callers

-- Users can update their own name; admins can update anything
create policy "profiles: users update own"
  on profiles for update
  using (auth.uid() = id or is_admin())
  with check (auth.uid() = id or is_admin());

-- ──────────────────────────────────────────────────────────────
-- categories
-- ──────────────────────────────────────────────────────────────

create policy "categories: anyone can read"
  on categories for select
  using (true);

create policy "categories: admins manage"
  on categories for all
  using (is_admin())
  with check (is_admin());

-- ──────────────────────────────────────────────────────────────
-- products
-- ──────────────────────────────────────────────────────────────

-- Customers see only active products; admins see everything
create policy "products: customers read active"
  on products for select
  using (
    is_active = true
    or is_admin()
  );

create policy "products: admins manage"
  on products for all
  using (is_admin())
  with check (is_admin());

-- ──────────────────────────────────────────────────────────────
-- orders
-- ──────────────────────────────────────────────────────────────

create policy "orders: users read own, admins read all"
  on orders for select
  using (
    user_id = auth.uid()
    or is_admin()
  );

create policy "orders: authenticated users insert"
  on orders for insert
  with check (auth.uid() is not null);

create policy "orders: admins update"
  on orders for update
  using (is_admin())
  with check (is_admin());

-- ──────────────────────────────────────────────────────────────
-- order_items
-- ──────────────────────────────────────────────────────────────

create policy "order_items: users read own items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create policy "order_items: authenticated users insert"
  on order_items for insert
  with check (auth.uid() is not null);
