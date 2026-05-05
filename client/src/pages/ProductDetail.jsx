import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './ProductDetail.module.css';

const MOCK_IMAGES = (base, n) => Array.from({ length: n }, (_, i) => `${base}?sig=${i}`);

const REVIEWS = [
  { id: 1, user: 'Asha K.', date: 'Mar 2026', rating: 5, text: 'Beautiful finish and fast delivery.' },
  { id: 2, user: 'Leo M.', date: 'Feb 2026', rating: 4, text: 'Solid quality; packaging was premium.' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const toast = useToast();
  const { toggle: toggleWish, has: wishHas } = useWishlist();
  const [products, setProducts] = useState([]);
  const [mainIdx, setMainIdx] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState({ details: true, ship: false, care: false });
  const [tab, setTab] = useState('reviews');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [products, id]
  );

  const images = useMemo(() => {
    if (!product?.image) return [];
    return MOCK_IMAGES(product.image, 4);
  }, [product]);

  const similar = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  }, [products, product]);

  const onAdd = useCallback(() => {
    if (!product) return;
    addItem(product, {
      qty,
      variantKey: `${color}-${size}`,
      variantLabel: `Color ${color + 1} · ${size}`,
    });
    toast.success('Added to cart');
  }, [addItem, product, qty, color, size, toast]);

  if (!product && products.length > 0) {
    return (
      <p className={styles.notFound}>
        Product not found. <Link to="/">Back home</Link>
      </p>
    );
  }

  if (!product) {
    return <p className={styles.loading}>Loading…</p>;
  }

  const avg = 4.7;

  return (
    <>
      <article className={styles.page}>
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img
              src={images[mainIdx] || product.image}
              alt={product.name}
              width={800}
              height={800}
              loading="eager"
              decoding="async"
            />
            <span className={styles.countPill}>
              {mainIdx + 1} / {images.length || 1}
            </span>
          </div>
          <div className={styles.thumbs}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`${styles.thumb} ${i === mainIdx ? styles.thumbActive : ''}`}
                onClick={() => setMainIdx(i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={src} alt="" width={72} height={72} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.detail}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden>/</span>
            <Link to="/#featured">{product.category}</Link>
            <span aria-hidden>/</span>
            <span className="truncate">{product.name}</span>
          </nav>
          <span className={styles.brand}>{product.category}</span>
          <h1 className={styles.title}>{product.name}</h1>
          <a href="#reviews" className={styles.ratingLink}>
            ★★★★☆ (124) · See reviews
          </a>
          <div className={styles.priceBlock}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.tag === 'Best Seller' && (
              <>
                <span className={styles.was}>${(product.price * 1.12).toFixed(2)}</span>
                <Badge variant="brand">Save 12%</Badge>
              </>
            )}
          </div>
          <p className={`${styles.desc} line-clamp-3`}>
            Precision fit and finish with materials chosen for longevity. Designed to stay quiet on
            your desk while you work with intention.
          </p>

          <div>
            <p className={styles.brand} style={{ marginBottom: 'var(--space-2)' }}>
              Color
            </p>
            <div className={styles.swatches}>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.swatch} ${color === i ? styles.swatchOn : ''}`}
                  style={{ background: i === 0 ? 'var(--color-bg-muted)' : 'var(--color-bg-overlay)' }}
                  aria-label={`Color ${i + 1}`}
                  onClick={() => setColor(i)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className={styles.brand} style={{ marginBottom: 'var(--space-2)' }}>
              Size
            </p>
            <div className={styles.sizes}>
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.sizeBtn} ${size === s ? styles.sizeOn : ''} ${s === 'XL' ? styles.sizeOos : ''}`}
                  disabled={s === 'XL'}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.qtyRow}>
            <span className={styles.brand}>Qty</span>
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span style={{ minWidth: 32, textAlign: 'center' }}>{qty}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>

          <Button variant="primary" fullWidth onClick={onAdd} bounceOnClick>
            Add to Cart
          </Button>
          <Button
            variant="outline"
            fullWidth
            type="button"
            onClick={() => {
              const was = wishHas(product.id);
              toggleWish(product.id);
              toast.success(was ? 'Removed from wishlist' : 'Saved to wishlist');
            }}
          >
            {wishHas(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>

          <div className={styles.trust}>
            <span>Secure checkout</span>
            <span>Free shipping over ₹999</span>
            <span>30-day returns</span>
          </div>

          <div className={styles.accordion}>
            {[
              ['details', 'Product Details', 'Materials, dimensions, and warranty information.'],
              ['ship', 'Shipping & Returns', 'Standard delivery 3–5 days. Free returns within 30 days.'],
              ['care', 'Care Instructions', 'Wipe with a soft cloth. Avoid harsh solvents.'],
            ].map(([key, label, text]) => (
              <div key={key}>
                <button
                  type="button"
                  className={styles.accBtn}
                  aria-expanded={openAcc[key]}
                  onClick={() => setOpenAcc((o) => ({ ...o, [key]: !o[key] }))}
                >
                  {label}
                  <span aria-hidden>{openAcc[key] ? '−' : '+'}</span>
                </button>
                <div
                  className={styles.accPanel}
                  style={{ maxHeight: openAcc[key] ? 200 : 0 }}
                  id={`acc-${key}`}
                >
                  <div className={styles.accInner}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      <section className={styles.tabsBelow} id="reviews" aria-label="Product tabs">
        <div className={styles.tabBar} role="tablist">
          {[
            ['reviews', 'Reviews'],
            ['questions', 'Questions'],
            ['similar', 'Similar Products'],
          ].map(([k, lab]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`${styles.tabBtn} ${tab === k ? styles.tabBtnOn : ''}`}
              onClick={() => setTab(k)}
            >
              {lab}
            </button>
          ))}
        </div>
        {tab === 'reviews' && (
          <div>
            <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--color-text-brand)' }}>
              {avg}
            </p>
            <div className={styles.histogram}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className={styles.barRow}>
                  <span>{star}★</span>
                  <div className={styles.bar}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {REVIEWS.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHead}>
                  <span className={styles.avatar}>{r.user.charAt(0)}</span>
                  <div>
                    <strong>{r.user}</strong>
                    <div className={styles.breadcrumb}>{r.date}</div>
                  </div>
                  <Badge variant="brand">{r.rating}★</Badge>
                </div>
                <p className={styles.desc}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'questions' && (
          <p className={styles.desc}>Ask a question — our team replies within one business day.</p>
        )}
        {tab === 'similar' && (
          <div className={styles.similar}>
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
