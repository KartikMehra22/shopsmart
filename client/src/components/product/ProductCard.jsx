import PropTypes from 'prop-types';
import { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './ProductCard.module.css';

function StarRow({ rating, count }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('☆');
    else stars.push('☆');
  }
  return (
    <div className={styles.ratingRow}>
      <span className={styles.stars} aria-hidden>
        {stars.join('')}
      </span>
      <span>
        ({count})
      </span>
    </div>
  );
}

StarRow.propTypes = {
  rating: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
};

/** Isolated so `key={src}` can reset state; ref handles images that finish loading from cache before onLoad attaches. */
function CardProductImage({ src, alt, fallbackChar }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const setImgRef = useCallback((el) => {
    if (el?.complete && el.naturalHeight > 0) {
      setLoaded(true);
    }
  }, []);

  if (!src || failed) {
    return (
      <div className={styles.placeholder} aria-hidden>
        {fallbackChar}
      </div>
    );
  }

  return (
    <div className={styles.imgStack}>
      {!loaded && <Skeleton variant="rect" className={styles.skelImg} />}
      <img
        ref={setImgRef}
        src={src}
        alt={alt}
        width={600}
        height={600}
        loading="lazy"
        decoding="async"
        className={`${styles.img} ${loaded ? styles.imgLoaded : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

CardProductImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  fallbackChar: PropTypes.string.isRequired,
};

function ProductCardInner({
  product,
  loading = false,
  outOfStock = false,
  reviewRating = 4.5,
  reviewCount = 124,
  originalPrice,
  showMoveToCart = false,
  onPrimaryAction,
}) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [bounce, setBounce] = useState(false);

  const wishlisted = has(product.id);

  const discountPct = useMemo(() => {
    if (originalPrice == null || originalPrice <= product.price) return null;
    return Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }, [originalPrice, product.price]);

  const badge = useMemo(() => {
    if (outOfStock) return { label: 'Out of Stock', variant: 'danger' };
    if (product.tag === 'Best Seller') return { label: 'Sale', variant: 'danger' };
    if (product.tag === 'New Season' || product.tag === 'Limited Drop')
      return { label: 'New', variant: 'brand' };
    if (product.tag && product.price < 100) return { label: 'Low Stock', variant: 'warning' };
    return null;
  }, [product.tag, product.price, outOfStock]);

  const onAdd = useCallback(() => {
    if (outOfStock) return;
    if (onPrimaryAction) {
      onPrimaryAction(product);
    } else {
      addItem(product);
    }
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
  }, [addItem, product, outOfStock, onPrimaryAction]);

  const onWish = useCallback(() => {
    toggle(product.id);
  }, [toggle, product.id]);

  if (loading) {
    return (
      <Card padding="sm" className={styles.wrap}>
        <div className={styles.imgArea}>
          <Skeleton variant="rect" className={styles.skelImg} />
        </div>
        <div className={styles.body}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </Card>
    );
  }

  const initial = product.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Card hoverable padding="sm" className={`${styles.wrap} ${outOfStock ? styles.outOfStock : ''}`}>
      <div className={styles.imgArea}>
        <CardProductImage
          key={`${product.id}-${product.image || ''}`}
          src={product.image}
          alt={product.name}
          fallbackChar={initial}
        />
        {badge && (
          <div className={styles.badges}>
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          </div>
        )}
        <button
          type="button"
          className={`${styles.wishlist} ${wishlisted ? styles.wishlistActive : ''} ${bounce ? '' : ''}`}
          onClick={onWish}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} aria-hidden>
            <path
              d="M12 21s-6.716-4.5-9-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1.5 4 2.5.5-1 2-2.5 4-2.5 3.5 0 5.5 3.5 3 7.5-2.284 4-9 8.5-9 8.5z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
        {outOfStock && <div className={styles.overlayOos}>Out of Stock</div>}
      </div>
      <div className={styles.body}>
        <span className={styles.brand}>{product.category}</span>
        <h3 className={`${styles.name} line-clamp-2`}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <StarRow rating={reviewRating} count={reviewCount} />
        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          {originalPrice != null && originalPrice > product.price && (
            <>
              <span className={styles.was}>${originalPrice.toFixed(2)}</span>
              {discountPct != null && (
                <Badge variant="danger" size="sm">
                  {discountPct}% off
                </Badge>
              )}
            </>
          )}
        </div>
        <div className={`${styles.ctaWrap} ${styles.ctaDesktop} ${styles.ctaMobile}`}>
          <Button
            variant="primary"
            fullWidth
            disabled={outOfStock}
            onClick={onAdd}
            bounceOnClick
          >
            {showMoveToCart || onPrimaryAction ? 'Move to Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

ProductCardInner.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    image: PropTypes.string,
    tag: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool,
  outOfStock: PropTypes.bool,
  reviewRating: PropTypes.number,
  reviewCount: PropTypes.number,
  originalPrice: PropTypes.number,
  showMoveToCart: PropTypes.bool,
  onPrimaryAction: PropTypes.func,
};

const ProductCard = memo(ProductCardInner);
ProductCard.displayName = 'ProductCard';

export default ProductCard;
