import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import styles from './CartDrawer.module.css';

function CartItem({ line, onRemove, onQty }) {
  const [removing, setRemoving] = useState(false);
  const { product, qty, variantLabel, key } = line;

  return (
    <div className={`${styles.item} ${removing ? styles.itemRemoving : ''}`}>
      <img
        className={styles.thumb}
        src={product.image || undefined}
        alt={product.name}
        width={72}
        height={72}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.meta}>
        <p className={`${styles.name} truncate`}>{product.name}</p>
        {variantLabel && <p className={styles.variant}>{variantLabel}</p>}
        <div className={styles.row}>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              aria-label="Decrease quantity"
              onClick={() => onQty(key, qty - 1)}
            >
              −
            </button>
            <input
              className={styles.qty}
              aria-label="Quantity"
              value={qty}
              readOnly
            />
            <button
              type="button"
              className={styles.stepBtn}
              aria-label="Increase quantity"
              onClick={() => onQty(key, qty + 1)}
            >
              +
            </button>
          </div>
          <span className={styles.price}>${(product.price * qty).toFixed(2)}</span>
        </div>
        <button
          type="button"
          className={styles.remove}
          onClick={() => {
            setRemoving(true);
            setTimeout(() => onRemove(key), 200);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

CartItem.propTypes = {
  line: PropTypes.shape({
    key: PropTypes.string.isRequired,
    product: PropTypes.object.isRequired,
    qty: PropTypes.number.isRequired,
    variantLabel: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onQty: PropTypes.func.isRequired,
};

export default memo(CartItem);
