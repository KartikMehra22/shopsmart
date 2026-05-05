# Frontend Reference

The frontend is a **React 18** single-page application built with **Vite** and styled with **CSS Modules**. All routes are lazily loaded via `React.lazy` + `Suspense`.

---

## Entry Points

| File | Role |
|---|---|
| `client/index.html` | HTML shell; mounts `#root` |
| `client/src/main.jsx` | Renders `<App />` into `#root` |
| `client/src/App.jsx` | Router, context providers, lazy route declarations |

---

## Routing

Routes are declared in `App.jsx` under a shared `<Layout>` element (Navbar + Footer wrapper).

| Path | Page Component | Description |
|---|---|---|
| `/` | `Home` | Hero, category strip, featured products, promo banner, trending carousel |
| `/product/:id` | `ProductDetail` | Full product page with image, description, variant picker, and add-to-cart |
| `/cart` | `Cart` | Cart item list with quantity controls and subtotal |
| `/checkout` | `Checkout` | Checkout placeholder page |
| `/login` | `Login` | Login form |
| `/register` | `Register` | Registration form |
| `/profile` | `Profile` | User profile page |
| `*` | `NotFound` | 404 fallback |

---

## Pages

### `Home.jsx`
The main storefront page. Features:
- **Hero section** with a parallax mouse-tracking effect on the product showcase grid.
- **Category strip** — horizontally scrollable pill filter buttons from the `/api/categories` endpoint.
- **Featured Products grid** — filters and sorts products client-side using `useMemo`. Sort options: `Price: Low to High`, `Price: High to Low`, `Newest`, `Rating`.
- **Promo banner** — promotional section with a CTA.
- **Trending carousel** — displays the first 8 products.

### `ProductDetail.jsx`
Full product detail page with:
- Large product image
- Name, price, optional "original price" for discounted items
- Variant selector
- `Add to Cart` button (uses `useCart()`)
- Toast notification on add

### `Cart.jsx`
Shopping cart page showing:
- All cart line items via `useCart()`
- Per-item quantity controls (increment / decrement / remove)
- Subtotal calculation

### `Checkout.jsx`
Placeholder page — checkout flow is not yet implemented.

### `Login.jsx` / `Register.jsx`
Auth forms (UI only; no backend auth implemented yet).

### `Profile.jsx`
User profile display page.

### `NotFound.jsx`
Friendly 404 page with a link back to home.

---

## Components

### Layout

| Component | Description |
|---|---|
| `Layout.jsx` | Wraps all pages; renders `<Navbar>` and `<Footer>` with an `<Outlet>` |
| `Navbar.jsx` | Top navigation bar: logo, links, search, wishlist icon, cart icon with item-count badge, mobile hamburger menu |
| `Footer.jsx` | Site footer with links and branding |

### Cart

| Component | Description |
|---|---|
| `CartDrawer.jsx` | Slide-in cart panel, toggled from the Navbar cart icon. Renders `CartItem` rows and a checkout CTA. |
| `CartItem.jsx` | Single line item inside `CartDrawer` or `Cart` page. Shows image, name, variant, price × qty, remove button. |

### Product

| Component | Description |
|---|---|
| `ProductCard.jsx` | Product tile used in grid/carousel. Shows image, tag badge, name, price, optional original price (strikethrough), wishlist toggle, and an "Add to Cart" button. |

### UI Primitives

| Component | Description |
|---|---|
| `Button.jsx` | Polymorphic button with `variant` prop: `primary`, `secondary`, `ghost`, `danger`. Supports `as` prop for rendering as `<a>`. |
| `Badge.jsx` | Small label chip for promotional tags. |
| `Card.jsx` | Generic card container with border and shadow. |
| `Dropdown.jsx` | Accessible custom select with keyboard navigation. |
| `EmptyState.jsx` | Centered illustration + message for empty lists. |
| `ErrorBoundary.jsx` | React class-based error boundary; wraps the entire app. |
| `Input.jsx` | Styled text input with label and optional error message. |
| `Modal.jsx` | Focus-trapped modal dialog with an overlay backdrop. |
| `Pagination.jsx` | Page number nav with prev/next buttons. |
| `Skeleton.jsx` | Animated loading placeholder for content. |
| `PageLoader.jsx` | Full-page spinner shown during lazy route chunk loading. |

---

## Contexts

### `CartContext` (`src/context/CartContext.jsx`)

Provides global cart state. Wraps the app in `CartProvider`.

**Exposed via `useCart()`:**

| Key | Type | Description |
|---|---|---|
| `lines` | `CartLine[]` | Array of line items |
| `drawerOpen` | `boolean` | Whether the cart drawer is visible |
| `setDrawerOpen` | `(open: boolean) => void` | Toggle the cart drawer |
| `addItem` | `(product, opts?) => void` | Add or increment a product. `opts`: `{ qty, variantKey, variantLabel }` |
| `removeItem` | `(key: string) => void` | Remove a line item by its composite key |
| `updateQty` | `(key: string, qty: number) => void` | Set a line item's quantity (min 1; removes if 0) |
| `clearCart` | `() => void` | Empty the cart |
| `itemCount` | `number` | Total units across all lines |
| `subtotal` | `number` | Sum of `price × qty` for all lines |

A `CartLine` has: `{ key, product, qty, variantKey, variantLabel }`.

### `ToastContext` (`src/context/ToastContext.jsx`)

Provides a notification system. Wraps the app in `ToastProvider`.

**Exposed via `useToast()`:**

| Method | Description |
|---|---|
| `toast.success(message, durationMs?)` | Show a green success notification |
| `toast.error(message, durationMs?)` | Show a red error notification |
| `toast.warning(message, durationMs?)` | Show a yellow warning notification |
| `toast.info(message, durationMs?)` | Show a blue informational notification |

Default duration is `4000 ms`. Pass `0` for a persistent toast.

### `WishlistContext` (`src/context/WishlistContext.jsx`)

Provides wishlist (saved items) state via `WishlistProvider`.

---

## Custom Hooks

### `useBreakpoint()`

Returns the current responsive breakpoint derived from `window.innerWidth`.

```js
const { isMobile, isXl, name } = useBreakpoint();
```

| Breakpoint | Min Width |
|---|---|
| `xs` | 0 px |
| `sm` | 480 px |
| `md` | 640 px |
| `lg` | 768 px |
| `xl` | 1024 px |
| `2xl` | 1280 px |
| `3xl` | 1536 px |

`isMobile` is `true` when the breakpoint is narrower than `lg` (768 px).

### `useDebounce(value, delay)`

Returns a debounced copy of `value` that updates after `delay` ms of inactivity. Used for search inputs.

### `useFocusTrap(ref)`

Traps keyboard focus within the referenced element while it is active. Used by `Modal` and `CartDrawer` for accessibility.

---

## Styling

- **CSS Modules** — every component has a co-located `.module.css` file.
- **Design tokens** are defined in `src/styles/` and imported where needed.
- **No utility CSS framework** is used (no Tailwind, no Bootstrap).
- Global base reset and font setup is in `src/index.css`.

---

## State Management Summary

| State | Where Stored | Persisted? |
|---|---|---|
| Product catalog | Fetched per-session in `Home` / `ProductDetail` | No (re-fetched on mount) |
| Cart items | `CartContext` (in-memory) | No (lost on refresh) |
| Wishlist | `WishlistContext` (in-memory) | No |
| Toast queue | `ToastContext` (in-memory) | No |
| Auth / User | Not yet implemented | — |
