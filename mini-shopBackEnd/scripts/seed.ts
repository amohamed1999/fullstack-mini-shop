import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// ── Validate required env vars ────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Seed data ─────────────────────────────────────────────────────────────────

const USERS = [
  {
    email: 'admin@minishop.dev',
    password: 'Admin1234!',
    name: 'Shop Admin',
    role: 'admin' as const,
  },
  {
    email: 'customer@minishop.dev',
    password: 'Customer1234!',
    name: 'Jane Customer',
    role: 'customer' as const,
  },
];

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Books', slug: 'books' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function upsertUser(u: (typeof USERS)[0]) {
  // Check if user exists
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find((x) => x.email === u.email);

  let userId: string;

  if (found) {
    userId = found.id;
    console.log(`  ↩  User already exists: ${u.email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser failed: ${error.message}`);
    userId = data.user.id;
    console.log(`  ✅  Created auth user: ${u.email}`);
  }

  // Upsert profile (runs even when auth user already existed)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: userId, name: u.name, role: u.role }, { onConflict: 'id' });

  if (profileError) throw new Error(`profile upsert: ${profileError.message}`);

  console.log(`  ✅  Profile ready: ${u.email} (${u.role})`);
  return userId;
}

async function seed() {
  console.log('\n🌱  Starting seed...\n');

  // 1. Users
  console.log('👤  Seeding users...');
  for (const u of USERS) {
    await upsertUser(u);
  }

  // 2. Categories
  console.log('\n📂  Seeding categories...');
  const { data: cats, error: catError } = await admin
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select();

  if (catError) throw new Error(`categories: ${catError.message}`);

  const catMap = Object.fromEntries(
    (cats ?? []).map((c: { slug: string; id: string }) => [c.slug, c.id]),
  );
  console.log(`  ✅  ${cats?.length} categories`);

  // 3. Products
  console.log('\n📦  Seeding products...');
  const PRODUCTS = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with titanium design',
      price: 999.99,
      category_id: catMap['electronics'],
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Flagship Android smartphone',
      price: 849.99,
      category_id: catMap['electronics'],
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-cancelling wireless headphones',
      price: 349.99,
      category_id: catMap['electronics'],
    },
    {
      name: 'MacBook Air M3',
      description: 'Ultra-thin laptop with Apple Silicon',
      price: 1299.99,
      category_id: catMap['electronics'],
    },
    {
      name: 'Men\'s Classic White T-Shirt',
      description: 'Premium 100% cotton basic tee',
      price: 19.99,
      category_id: catMap['clothing'],
    },
    {
      name: 'Women\'s Slim Fit Jeans',
      description: 'High-waisted blue denim jeans',
      price: 49.99,
      category_id: catMap['clothing'],
    },
    {
      name: 'Unisex Hoodie',
      description: 'Cozy fleece-lined hooded sweatshirt',
      price: 39.99,
      category_id: catMap['clothing'],
    },
    {
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship by Robert C. Martin',
      price: 29.99,
      category_id: catMap['books'],
    },
    {
      name: 'The Pragmatic Programmer',
      description: 'From journeyman to master — classic software engineering book',
      price: 34.99,
      category_id: catMap['books'],
    },
    {
      name: 'Designing Data-Intensive Applications',
      description: 'The big ideas behind reliable, scalable, and maintainable systems',
      price: 44.99,
      category_id: catMap['books'],
    },
  ];

  let productCount = 0;
  for (const p of PRODUCTS) {
    const { data: existing } = await admin
      .from('products')
      .select('id')
      .eq('name', p.name)
      .maybeSingle();

    const { error: prodError } = existing
      ? await admin.from('products').update(p).eq('id', existing.id)
      : await admin.from('products').insert(p);

    if (prodError) throw new Error(`products: ${prodError.message}`);
    productCount++;
  }
  console.log(`  ✅  ${productCount} products`);

  console.log('\n✨  Seed complete!\n');
  console.log('  Admin:    admin@minishop.dev / Admin1234!');
  console.log('  Customer: customer@minishop.dev / Customer1234!\n');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
