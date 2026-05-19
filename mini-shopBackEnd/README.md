# 🛍️ Mini Shop API

A production-ready e-commerce backend built with **Fastify**, **TypeScript**, **Supabase**, and **PostgreSQL**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Fastify 4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Validation | Zod |
| Logging | Pino |
| Security | Helmet · CORS · Rate-limit |

---

## Project Structure

```
src/
├── app.ts                    # Fastify app factory
├── server.ts                 # Entry point
├── config/
│   └── env.ts                # Environment validation (Zod)
├── lib/
│   └── supabase.ts           # Supabase client instances
├── middleware/
│   ├── authenticate.ts       # JWT verification
│   └── authorize.ts          # Role-based authorization
├── modules/
│   ├── auth/                 # Register · Login · Me
│   ├── products/             # CRUD + image upload
│   ├── orders/               # Create · My orders · Admin view
│   ├── categories/           # CRUD
│   └── users/                # Admin user listing
├── plugins/
│   ├── errorHandler.ts       # Centralized error responses
│   └── security.ts           # Helmet · CORS · Rate-limit
├── types/
│   └── index.ts              # Shared TypeScript types
└── utils/
    ├── errors.ts             # Custom error classes
    ├── pagination.ts         # Pagination helpers
    ├── response.ts           # Response helpers
    └── storage.ts            # Supabase Storage upload helper
database/
├── schema.sql                # Table definitions
├── rls_policies.sql          # Row Level Security policies
└── storage.sql               # Storage bucket + policies
scripts/
└── seed.ts                   # Database seeder
```

---

## Environment Setup

Copy and fill in `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3000`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |
| `JWT_SECRET` | Secret for JWT verification (≥32 chars) |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name (default `products`) |

---

## Supabase Setup

### 1. Create a project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run SQL migrations

In the **SQL Editor** run the following files **in order**:

```
1. database/schema.sql
2. database/rls_policies.sql
3. database/storage.sql
```

### 3. Get your keys

In **Settings → API** copy:
- Project URL → `SUPABASE_URL`
- `anon` public key → `SUPABASE_ANON_KEY`
- `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Installation & Running

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build
npm run build

# Production
npm start

# Seed database
npm run seed

# Lint
npm run lint
```

---

## API Reference

All error responses share this shape:
```json
{ "statusCode": 400, "error": "Bad Request", "message": "..." }
```

All success responses:
```json
{ "success": true, "data": { ... } }
```

---

### Auth

#### `POST /auth/register`
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "12345678"
}
```
Returns `{ accessToken, refreshToken, user }`.

#### `POST /auth/login`
```json
{ "email": "ahmed@example.com", "password": "12345678" }
```
Returns `{ accessToken, refreshToken, user }`.

#### `POST /auth/forgot-password`
```json
{ "email": "ahmed@example.com" }
```

#### `GET /auth/me`
Requires `Authorization: Bearer <token>`.

---

### Products

#### `GET /products`
Query params: `search`, `category` (UUID), `page`, `limit`.

```
GET /products?search=iphone&page=1&limit=10
```

#### `GET /products/:id`

#### `POST /products` *(admin)*
`Content-Type: multipart/form-data`

Fields: `name`, `description`, `price`, `category_id`, `image` (file).

#### `PATCH /products/:id` *(admin)*
Partial update — JSON or multipart.

#### `DELETE /products/:id` *(admin)*
Soft-deletes (sets `is_active = false`).

---

### Orders

#### `POST /orders` *(authenticated)*
```json
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ]
}
```

#### `GET /orders/my` *(authenticated)*
Returns your order history with items and product data.

#### `GET /orders` *(admin)*
Query params: `status`, `page`, `limit`.

#### `PATCH /orders/:id/status` *(admin)*
```json
{ "status": "shipped" }
```
Allowed: `pending` · `processing` · `shipped` · `delivered` · `cancelled`.

---

### Categories

| Method | Path | Auth |
|---|---|---|
| `GET` | `/categories` | Public |
| `GET` | `/categories/:id` | Public |
| `POST` | `/categories` | Admin |
| `PATCH` | `/categories/:id` | Admin |
| `DELETE` | `/categories/:id` | Admin |

---

### Users *(admin)*

| Method | Path |
|---|---|
| `GET` | `/users` |
| `GET` | `/users/:id` |

---

## Security

- **Helmet** — sets secure HTTP headers
- **CORS** — configurable via `CORS_ORIGIN` env var
- **Rate limiting** — 100 req/min per IP
- **RLS** — Supabase Row Level Security on all tables
- **Env validation** — server won't start with missing/invalid config
- **Service-role isolation** — admin Supabase client never exposed to end users

---

## Seeded Test Accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@minishop.dev` | `Admin1234!` |
| Customer | `customer@minishop.dev` | `Customer1234!` |

---

## Example Requests (curl)

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmed","email":"ahmed@test.com","password":"12345678"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@test.com","password":"12345678"}'

# List products
curl http://localhost:3000/products?page=1&limit=5

# Create order (replace TOKEN)
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"PRODUCT_UUID","quantity":2}]}'

# Upload product (admin)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "name=New Product" \
  -F "price=99.99" \
  -F "image=@/path/to/photo.jpg"
```
