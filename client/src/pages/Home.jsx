import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import ProductCard from '../components/product/ProductCard';
import styles from './Home.module.css';

const SORT_OPTS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCat, setActiveCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const catRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroVisualRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to reach the catalog API (connection refused on port 5001).');
        setLoading(false);
      });
  }, []);

  const onHeroMove = useCallback((e) => {
    const el = heroVisualRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - 0.5) * 16;
    const py = ((e.clientY - r.top) / r.height - 0.5) * 16;
    setParallax({ x: Math.max(-8, Math.min(8, px)), y: Math.max(-8, Math.min(8, py)) });
  }, []);

  const featured = useMemo(() => {
    let list = [...products];
    if (activeCat !== 'All') {
      list = list.filter((p) => p.category === activeCat);
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    return list;
  }, [products, activeCat, sort]);

  const trending = useMemo(() => [...products].slice(0, 8), [products]);

  const showcase = useMemo(() => products.slice(0, 3), [products]);

  const scrollCat = useCallback((dir) => {
    const el = catRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }, []);

  if (loading) {
    return <p className={styles.status}>Loading catalog…</p>;
  }

  if (error) {
    return (
      <div className={`${styles.status} ${styles.statusErr} ${styles.errorBox}`} role="alert">
        <p>{error}</p>
        <p className={styles.errorHint}>
          Vite forwards <code className={styles.inlineCode}>/api/*</code> to{' '}
          <strong>http://localhost:5001</strong>. Start the Express app in another terminal:
        </p>
        <pre className={styles.errorCmd}>cd server && pnpm run dev</pre>
        <p className={styles.errorHint}>From repo root you can use: pnpm server</p>
      </div>
    );
  }

  return (
    <>
      <section className={styles.hero} id="top">
        <div className={styles.heroInner}>
          <h1 className={styles.headline}>Shop Without Limits</h1>
          <p className={styles.sub}>
            A focused storefront for tools and objects that earn their place on your desk and in
            your day.
          </p>
          <div className={styles.ctas}>
            <Button variant="primary" as="a" href="#featured">
              Shop Now
            </Button>
            <Button variant="ghost" as="a" href="#collections">
              View Collections
            </Button>
          </div>
          <div className={styles.trust}>
            <span>Free shipping</span>
            <span className={styles.dot} aria-hidden />
            <span>Secure checkout</span>
            <span className={styles.dot} aria-hidden />
            <span>Easy returns</span>
          </div>
        </div>
        <div
          className={styles.heroVisual}
          ref={heroVisualRef}
          onMouseMove={onHeroMove}
          role="presentation"
        >
          <div
            className={styles.floatGrid}
            style={{
              transform: `translate(${parallax.x}px, ${parallax.y}px)`,
              transition: 'transform 120ms ease-out',
            }}
          >
            {showcase.map((p) => (
              <div key={p.id} className={styles.floatCard}>
                <img
                  src={p.image}
                  alt={p.name}
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.catStrip} id="collections">
        <div className={styles.catRow}>
          <button type="button" className={styles.arrow} onClick={() => scrollCat(-1)} aria-label="Scroll categories left">
            ‹
          </button>
          <div className={styles.catScroll} ref={catRef}>
            <button
              type="button"
              className={`${styles.catPill} ${activeCat === 'All' ? styles.catPillActive : ''}`}
              onClick={() => setActiveCat('All')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.catPill} ${activeCat === c.name ? styles.catPillActive : ''}`}
                onClick={() => setActiveCat(c.name)}
              >
                <span aria-hidden>◇</span>
                {c.name}
              </button>
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={() => scrollCat(1)} aria-label="Scroll categories right">
            ›
          </button>
        </div>
      </section>

      <section className={styles.featured} id="featured">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <p className={styles.sectionSub}>Handpicked for you</p>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="Category filters">
            {['All', ...categories.map((c) => c.name)].map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={activeCat === name}
                className={`${styles.tab} ${activeCat === name ? styles.tabActive : ''}`}
                onClick={() => setActiveCat(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className={styles.sort}>
            <Dropdown options={SORT_OPTS} value={sort} onChange={setSort} placeholder="Sort" />
          </div>
        </div>
        <div className={styles.grid4}>
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              originalPrice={p.tag === 'Best Seller' ? p.price * 1.15 : undefined}
            />
          ))}
        </div>
      </section>

      <section className={styles.promo} aria-labelledby="promo-title">
        <div className={styles.pattern} aria-hidden />
        <div className={styles.promoInner}>
          <h2 id="promo-title">Members save on every drop</h2>
          <p>
            Join the list for early access to limited releases and complimentary shipping on wider
            baskets.
          </p>
          <Button variant="primary" as="a" href="#featured">
            Explore featured
          </Button>
        </div>
        <div className={styles.promoArt}>
          {products[0] && (
            <img
              src={products[0].image}
              alt=""
              width={600}
              height={450}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </section>

      <section className={styles.carouselSec} aria-labelledby="trending-title">
        <div className={styles.carouselHead}>
          <h2 id="trending-title" className={styles.sectionTitle}>
            Trending now
          </h2>
          <div>
            <button type="button" className={styles.arrow} aria-label="Scroll trending left">
              ‹
            </button>
            <button type="button" className={styles.arrow} aria-label="Scroll trending right">
              ›
            </button>
          </div>
        </div>
        <div className={styles.carousel}>
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
