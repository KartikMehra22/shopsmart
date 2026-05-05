import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import styles from './CartDrawer.module.css';

function BagIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function CartDrawer() {
  const { lines, drawerOpen, setDrawerOpen, removeItem, updateQty, itemCount, subtotal } =
    useCart();

  const onQty = useCallback(
    (key, q) => {
      updateQty(key, q);
    },
    [updateQty]
  );

  if (!drawerOpen) return null;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close cart"
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={styles.panel} aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart ({itemCount} items)</h2>
          <button
            type="button"
            className={styles.close}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <div className={styles.list}>
          {lines.length === 0 ? (
            <EmptyState
              icon={<BagIllustration />}
              title="Your cart is empty"
              description="Browse featured products and add what you love."
              action={{
                label: 'Start Shopping',
                to: '/',
                variant: 'primary',
              }}
            />
          ) : (
            lines.map((line) => (
              <CartItem key={line.key} line={line} onRemove={removeItem} onQty={onQty} />
            ))
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" fullWidth as={Link} to="/cart" onClick={() => setDrawerOpen(false)}>
              View Cart
            </Button>
            <Button variant="primary" fullWidth as={Link} to="/cart" onClick={() => setDrawerOpen(false)}>
              Checkout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
