import { useState, useEffect } from 'react'

// ─────────── Data ────────────
const TAG_COLORS = {
  'Best Seller':   '#d4a96a',
  'Limited Drop':  '#e05c5c',
  "Editor's Pick": '#7eb8f7',
  'New Season':    '#78c9a0',
}

// ─────────── Components ──────

function Nav({ cartCount }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <span className="nav-logo">SHOP<span className="nav-logo-thin">SMART</span></span>
      <div className="nav-links">
        <a href="#new">New</a>
        <a href="#categories">Collections</a>
        <a href="#bestsellers">Best Sellers</a>
      </div>
      <button className="nav-bag">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <span>Bag</span>
        {cartCount > 0 && <span className="nav-bag-count">{cartCount}</span>}
      </button>
    </nav>
  )
}

const HERO_IMG = 'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=1400&q=85&fit=crop'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
      <div className="hero-overlay" />
      <div className="hero-glow" />
      <div className="hero-content fade-in">
        <p className="hero-eyebrow">Spring / Summer Collection 2026</p>
        <h1 className="hero-headline">
          Craft your<br />
          <em>perfect</em> space.
        </h1>
        <p className="hero-sub">
          Precision-engineered tools for those who work with intention.<br />
          Every detail considered. Nothing wasted.
        </p>
        <div className="hero-ctas">
          <a href="#new" className="btn btn--primary">Shop Collection</a>
          <a href="#bestsellers" className="btn btn--ghost">Explore Best Sellers</a>
        </div>
      </div>
      <div className="hero-badge">
        <span>Free shipping over $150</span>
      </div>
    </section>
  )
}

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const tagColor = TAG_COLORS[product.tag] || '#aaa'

  return (
    <article className="card">
      <div className="card-img-wrap">
        <img className="card-img" src={product.image} alt={product.name} />
        {product.tag && (
          <span className="card-badge" style={{ color: tagColor, borderColor: tagColor + '55' }}>
            {product.tag}
          </span>
        )}
      </div>
      <div className="card-body">
        <p className="card-category">{product.category}</p>
        <h3 className="card-name">{product.name}</h3>
        <div className="card-footer">
          <span className="card-price">${product.price.toFixed(2)}</span>
          <button className={`card-btn ${added ? 'card-btn--added' : ''}`} onClick={handleAdd}>
            {added ? '✓ Added' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </article>
  )
}

function Section({ id, label, title, products, onAdd }) {
  return (
    <section className="products-section" id={id}>
      <div className="section-header">
        <span className="section-label">{label}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="product-grid">
        {products.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
      </div>
    </section>
  )
}

function Categories({ categories }) {
  return (
    <section className="cat-section" id="categories">
      <div className="section-header">
        <span className="section-label">Browse</span>
        <h2 className="section-title">Collections</h2>
      </div>
      <div className="cat-grid">
        {categories.map(c => (
          <div key={c.id} className="cat-card">
            <img className="cat-img" src={c.image} alt={c.name} />
            <div className="cat-info">
              <span className="cat-name">{c.name}</span>
              <span className="cat-count">{c.count} products</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Banner() {
  return (
    <section className="banner">
      <div className="banner-glow" />
      <div className="banner-content">
        <p className="banner-tag">Limited Offer</p>
        <h2 className="banner-headline">Free shipping<br />on all orders over $150</h2>
        <a href="#new" className="btn btn--primary">Shop Now</a>
      </div>
    </section>
  )
}

// ─────────── App ─────────────
export default function App() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [cart,       setCart]       = useState([])

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
    .then(([prods, cats]) => { setProducts(prods); setCategories(cats); setLoading(false) })
    .catch(() => { setError('Backend is not running. Start it with: cd server && npm run dev'); setLoading(false) })
  }, [])

  const addToCart = (p) => setCart(prev => [...prev, p])

  const newArrivals  = products.filter(p => ['New Season', "Editor's Pick", 'Limited Drop'].includes(p.tag))
  const bestSellers  = products.filter(p => p.tag === 'Best Seller')
  const rest         = products.filter(p => !newArrivals.includes(p) && !bestSellers.includes(p))

  return (
    <div className="page">
      <Nav cartCount={cart.length} />

      <Hero />

      {loading && <p className="state-msg">Loading products…</p>}
      {error   && <p className="state-msg error">{error}</p>}

      {!loading && !error && (<>
        <Section
          id="new" label="Just Arrived" title="New This Season"
          products={[...newArrivals, ...rest].slice(0, 4)} onAdd={addToCart}
        />
        <Categories categories={categories} />
        <Banner />
        <Section
          id="bestsellers" label="Top Picks" title="Best Sellers"
          products={[...bestSellers, ...rest]} onAdd={addToCart}
        />
      </>)}

      <footer className="footer">
        <span className="footer-logo">SHOPSMART</span>
        <p>© 2026 ShopSmart. All rights reserved.</p>
      </footer>
    </div>
  )
}
