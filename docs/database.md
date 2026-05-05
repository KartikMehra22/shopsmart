# Database

ShopSmart uses **SQLite** via **Prisma ORM** for local development and in the AWS ECS container. The `DATABASE_URL` environment variable controls the file path; switching to PostgreSQL only requires changing the `provider` in `schema.prisma`.

---

## Schema

File: `server/prisma/schema.prisma`

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  tag       String?          // Nullable promotional badge
  category  String           // Foreign key by name (denormalized)
  image     String           // Absolute URL
  createdAt DateTime @default(now())
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  count Int                  // Denormalized product count
  image String               // Absolute URL
}
```

### Models

#### `Product`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `Int` | PK, autoincrement | Unique product identifier |
| `name` | `String` | required | Display name |
| `price` | `Float` | required | Price in USD |
| `tag` | `String?` | optional | Promo badge (`"Best Seller"`, `"Limited Drop"`, `"New Season"`, `"Editor's Pick"`) |
| `category` | `String` | required | Category name (matches `Category.name`) |
| `image` | `String` | required | Image URL |
| `createdAt` | `DateTime` | auto | Record creation timestamp |

#### `Category`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `Int` | PK, autoincrement | Unique category identifier |
| `name` | `String` | required | Category label |
| `count` | `Int` | required | Number of products in this category |
| `image` | `String` | required | Category image URL |

> **Note**: `Product.category` is a plain string matching `Category.name`. There is no Prisma-level foreign key relation. This is intentional for simplicity; a formal relation can be added later.

---

## Migrations

Migrations are stored in `server/prisma/migrations/`. Prisma generates them automatically when the schema changes.

### Apply migrations

```bash
cd server
pnpm prisma migrate deploy    # Production / CI (applies existing migrations)
pnpm prisma migrate dev       # Development (creates new migration if schema changed)
```

### Create a new migration (development)

```bash
cd server
# Edit schema.prisma first, then:
pnpm prisma migrate dev --name descriptive-name
```

---

## Seed Data

File: `server/prisma/seed.js`

The seed script populates the database with 8 products across 4 categories.

**Products**

| Name | Price | Category | Tag |
|---|---|---|---|
| Wireless ANC Headphones | $189 | Audio | Best Seller |
| Mechanical Keyboard 75% | $159 | Workspace | Limited Drop |
| USB-C Hub 7-in-1 | $59 | Workspace | — |
| Architect Desk Lamp | $89 | Workspace | New Season |
| 4K Webcam Ultra | $119 | Video | Editor's Pick |
| Mouse Pad XL Leather | $34 | Workspace | — |
| Portable SSD 1TB | $99 | Storage | Best Seller |
| Minimal Laptop Stand | $49 | Workspace | New Season |

**Categories**

| Name | Count |
|---|---|
| Workspace | 5 |
| Audio | 1 |
| Video | 1 |
| Storage | 1 |

### Run the seed

```bash
cd server
pnpm prisma db seed
```

This is also called automatically in CI and by the Playwright E2E test server setup.

---

## Database Files

| File | Purpose |
|---|---|
| `server/prisma/dev.db` | Local development database (git-ignored) |
| `server/prisma/ci.db` | Ephemeral CI database created per workflow run |
| `server/prisma/test-e2e.db` | Ephemeral E2E test database created by Playwright |
| `server/prisma/prod.db` | Production database inside the ECS container |

> All `.db` files are git-ignored. Never commit a database file.

---

## Prisma Client

The Prisma Client is generated during the Docker build and in CI:

```bash
pnpm prisma generate
```

In production the container entrypoint runs `prisma migrate deploy` before starting the server to apply any pending migrations automatically.

---

## Switching to PostgreSQL

1. Update `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Run `pnpm prisma migrate dev` to generate a new migration.
