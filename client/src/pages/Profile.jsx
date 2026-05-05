import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './Profile.module.css';

const MOCK_ORDERS = [
  {
    id: 'SS-10021',
    date: '2026-03-12',
    status: 'Delivered',
    total: 289,
    items: 3,
    thumbs: [],
  },
  {
    id: 'SS-10008',
    date: '2026-02-02',
    status: 'Shipped',
    total: 142,
    items: 1,
    thumbs: [],
  },
];

const OrderCard = memo(function OrderCard({ order, products, onOpen }) {
  const imgs = products.slice(0, 3);
  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHead}>
        <div>
          <strong>{order.id}</strong>
          <div className={styles.muted}>{order.date}</div>
        </div>
        <Badge variant={order.status === 'Delivered' ? 'success' : 'info'}>{order.status}</Badge>
      </div>
      <div className={styles.thumbs}>
        {imgs.map((p) => (
          <img key={p.id} src={p.image} alt="" width={48} height={48} loading="lazy" />
        ))}
      </div>
      <div className={styles.orderHead}>
        <span>${order.total.toFixed(2)}</span>
        <Button variant="outline" size="sm" type="button" onClick={() => onOpen(order)}>
          View Details
        </Button>
      </div>
    </div>
  );
});

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  products: PropTypes.array.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default function Profile() {
  const [search, setSearch] = useSearchParams();
  const tab = search.get('tab') || 'overview';
  const setTab = useCallback(
    (t) => {
      const next = new URLSearchParams(search);
      next.set('tab', t);
      setSearch(next, { replace: true });
    },
    [search, setSearch]
  );

  const [products, setProducts] = useState([]);
  const { ids: wishIds, toggle } = useWishlist();
  const { addItem } = useCart();
  const [orderFilter, setOrderFilter] = useState('All');
  const [modalOrder, setModalOrder] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const wishProducts = useMemo(
    () => products.filter((p) => wishIds.has(p.id)),
    [products, wishIds]
  );

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All') return MOCK_ORDERS;
    return MOCK_ORDERS.filter((o) => o.status === orderFilter);
  }, [orderFilter]);

  const side = (id, label) => (
    <button
      key={id}
      type="button"
      className={`${styles.sideLink} ${tab === id ? styles.sideActive : ''}`}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Account sections">
        {side('overview', 'Overview')}
        {side('orders', 'My Orders')}
        {side('wishlist', 'Wishlist')}
        {side('addresses', 'Addresses')}
        {side('payments', 'Payment Methods')}
        {side('notifications', 'Notifications')}
        {side('security', 'Security')}
        <button type="button" className={styles.sideLink} onClick={() => setTab('logout')}>
          Logout
        </button>
      </aside>

      <div className={styles.content}>
        {tab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatar}>
                U
                <span className={styles.avatarOverlay}>Edit</span>
              </div>
              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)' }}>Guest User</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>guest@shopsmart.demo</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Member since 2025
                </p>
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>12</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Orders
                </span>
              </div>
              <div className={styles.stat}>
                <strong>{wishIds.size}</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Wishlist
                </span>
              </div>
              <div className={styles.stat}>
                <strong>4</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Reviews
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h1 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-2xl)' }}>
              My Orders
            </h1>
            <div className={styles.orderTabs}>
              {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((f) => (
                <Button
                  key={f}
                  variant={orderFilter === f ? 'primary' : 'ghost'}
                  size="sm"
                  type="button"
                  onClick={() => setOrderFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
            {filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                products={products}
                onOpen={setModalOrder}
              />
            ))}
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            <h1 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-2xl)' }}>
              Wishlist
            </h1>
            <div className={styles.grid}>
              {wishProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showMoveToCart
                  onPrimaryAction={(prod) => {
                    addItem(prod);
                    toggle(prod.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {['addresses', 'payments', 'notifications', 'security'].includes(tab) && (
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This section is a placeholder for {tab} management.
          </p>
        )}

        {tab === 'logout' && (
          <p style={{ color: 'var(--color-text-secondary)' }}>
            You are not signed in to a persistent session in this demo.
          </p>
        )}
      </div>

      <Modal open={!!modalOrder} onClose={() => setModalOrder(null)} title={`Order ${modalOrder?.id}`}>
        {modalOrder && (
          <>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Placed {modalOrder.date} · {modalOrder.status}
            </p>
            <div className={styles.timeline}>
              <div className={styles.tlItem}>Order placed</div>
              <div className={styles.tlItem}>Processing</div>
              <div className={styles.tlItem}>Shipped</div>
              <div className={styles.tlItem}>Delivered</div>
            </div>
            <p>Items: {modalOrder.items}</p>
            <p>Total: ${modalOrder.total.toFixed(2)}</p>
          </>
        )}
      </Modal>
    </div>
  );
}
