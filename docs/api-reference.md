# API Reference

Base URL (local): `http://localhost:5001`  
Base URL (production): `http://<ALB-DNS>`

All responses are JSON. The server does not currently implement authentication headers; protected endpoints return a static `403`.

---

## Health

### `GET /api/health`

Returns the server status. Used by the ALB health check, Docker `HEALTHCHECK`, and smoke tests.

**Response `200 OK`**
```json
{ "status": "ok" }
```

---

## Products

### `GET /api/products`

Returns all products in the catalog.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "name": "Wireless ANC Headphones",
    "price": 189.0,
    "tag": "Best Seller",
    "category": "Audio",
    "image": "https://images.unsplash.com/...",
    "createdAt": "2026-04-26T00:00:00.000Z"
  },
  ...
]
```

**Fields**

| Field | Type | Description |
|---|---|---|
| `id` | `integer` | Auto-incremented primary key |
| `name` | `string` | Display name |
| `price` | `float` | Price in USD |
| `tag` | `string \| null` | Promotional badge (e.g. `"Best Seller"`, `"Limited Drop"`, `"New Season"`) |
| `category` | `string` | Category name (matches `Category.name`) |
| `image` | `string` | Absolute URL to product image |
| `createdAt` | `ISO 8601` | Record creation timestamp |

---

## Categories

### `GET /api/categories`

Returns all product categories.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "name": "Workspace",
    "count": 5,
    "image": "https://images.unsplash.com/..."
  },
  ...
]
```

**Fields**

| Field | Type | Description |
|---|---|---|
| `id` | `integer` | Auto-incremented primary key |
| `name` | `string` | Category label |
| `count` | `integer` | Number of products in category |
| `image` | `string` | Absolute URL to category image |

---

## Stub / Parity Routes

These endpoints are present as baseline implementations for future work. They return static mock data.

| Method | Path | Current Response |
|---|---|---|
| `GET` | `/api/users` | `{ message: "Users endpoint (Mock)" }` |
| `GET` | `/api/cart` | `{ items: [], total: 0 }` |
| `GET` | `/api/orders` | `{ orders: [] }` |
| `GET` | `/api/reviews` | `{ reviews: [] }` |
| `GET` | `/api/admin` | `403 { error: "Unauthorized" }` |

---

## Planned / Not Yet Implemented

The following capabilities are planned but not yet in the server:

- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — JWT-based authentication
- `POST /api/cart` — Persist cart items
- `POST /api/orders` — Place an order
- `POST /api/reviews` — Submit a product review

> **Cart state is currently handled entirely client-side** via `CartContext` (in-memory React state). It is not persisted between sessions.
