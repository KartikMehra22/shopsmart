import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import styles from './Navbar.module.css';

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.716-4.5-9-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1.5 4 2.5.5-1 2-2.5 4-2.5 3.5 0 5.5 3.5 3 7.5-2.284 4-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const debounced = useDebounce(search, 250);
  const { itemCount, setDrawerOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const suggestions = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [debounced, products]);

  const onPick = useCallback(
    (id) => {
      setSearch('');
      setSearchOpen(false);
      navigate(`/product/${id}`);
    },
    [navigate]
  );

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <Link to="/" className={styles.logo}>
          <LogoMark />
          <span>ShopSmart</span>
        </Link>

        <nav className={styles.menuDesktop} aria-label="Primary">
          <Link to="/#collections">Collections</Link>
          <Link to="/#featured">Featured</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/profile">Account</Link>
        </nav>

        <div
          className={`${styles.center} ${isMobile && !searchOpen ? styles.searchCollapsed : ''}`}
        >
          <div
            className={`${styles.searchWrap} ${isMobile && searchOpen ? styles.searchExpanded : ''}`}
          >
            {isMobile && (
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.mobileSearchBtn}`}
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
            <div
              className={`${styles.search} ${searchFocused ? styles.searchFocused : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                id="global-search"
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                autoComplete="off"
              />
              {!isMobile && <span className={styles.kbd}>⌘K</span>}
            </div>
            {suggestions.length > 0 && searchFocused && (
              <div className={styles.autocomplete} role="listbox">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    className={styles.acItem}
                    onMouseDown={() => onPick(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/profile?tab=wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <HeartIcon />
            {wishCount > 0 && <span className={styles.badge}>{wishCount}</span>}
          </Link>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={`Shopping cart, ${itemCount} items`}
            onClick={() => setDrawerOpen(true)}
          >
            <BagIcon />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
          <Link to="/profile" className={styles.avatar} aria-label="Account">
            U
          </Link>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.drawerBackdrop}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menu">
            <button
              type="button"
              className={styles.drawerClose}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/#collections" onClick={() => setMenuOpen(false)}>
              Collections
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart
            </Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              Register
            </Link>
          </div>
        </>
      )}
    </>
  );
}
