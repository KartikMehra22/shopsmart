import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import styles from './Cart.module.css';

export default function Cart() {
  const { lines, subtotal, removeItem, updateQty } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  const shipping = subtotal > 150 ? 0 : 12;
  const tax = subtotal * 0.08;
  const discount = couponMsg?.ok ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = useCallback(() => {
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setCouponMsg({ ok: true, text: '10% discount applied.' });
    } else if (coupon.trim()) {
      setCouponMsg({ ok: false, text: 'Invalid coupon code.' });
    }
  }, [coupon]);

  const payRow = useMemo(
    () => (
      <div className={styles.payIcons}>
        <span>Visa</span>
        <span>Mastercard</span>
        <span>UPI</span>
        <span>Amex</span>
      </div>
    ),
    []
  );

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products from the home page to see them here."
        action={{ label: 'Continue shopping', to: '/' }}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.items}>
        <h1 className={styles.name} style={{ fontSize: 'var(--text-2xl)' }}>
          Shopping Cart
        </h1>
        {lines.map((line) => (
          <div key={line.key} className={styles.item}>
            <CartItem line={line} onRemove={removeItem} onQty={updateQty} />
          </div>
        ))}
      </div>
      <aside className={styles.summary} aria-label="Order summary">
        <h2 className={styles.name} style={{ marginBottom: 'var(--space-4)' }}>
          Order summary
        </h2>
        <div className={styles.row}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className={styles.row}>
          <span>Estimated tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className={styles.row}>
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className={styles.coupon}>
          <label htmlFor="coupon" className="sr-only">
            Coupon code
          </label>
          <input
            id="coupon"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value);
              setCouponMsg(null);
            }}
            placeholder="Coupon code"
          />
          <Button type="button" variant="secondary" onClick={applyCoupon}>
            Apply
          </Button>
        </div>
        {couponMsg && (
          <p
            className={`${styles.couponMsg} ${couponMsg.ok ? styles.couponOk : styles.couponErr}`}
          >
            {couponMsg.text}
          </p>
        )}
        <Button variant="primary" fullWidth as={Link} to="/checkout">
          Proceed to Checkout
        </Button>
        {payRow}
      </aside>
    </div>
  );
}
