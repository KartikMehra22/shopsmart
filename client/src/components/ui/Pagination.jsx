import PropTypes from 'prop-types';
import { useMemo } from 'react';
import styles from './Pagination.module.css';

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) {
  const items = useMemo(() => {
    const total = Math.max(1, totalPages);
    const current = Math.min(Math.max(1, currentPage), total);
    const s = Math.max(0, siblingCount);
    const pages = [];
    const left = Math.max(2, current - s);
    const right = Math.min(total - 1, current + s);

    pages.push(1);
    if (left > 2) pages.push('…');
    range(left, right).forEach((p) => pages.push(p));
    if (right < total - 1) pages.push('…');
    if (total > 1) pages.push(total);

    const uniq = [];
    const seen = new Set();
    for (const p of pages) {
      const key = p;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(p);
    }
    return { uniq, current, total };
  }, [currentPage, totalPages, siblingCount]);

  if (items.total <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button
        type="button"
        className={styles.btn}
        onClick={() => onPageChange(items.current - 1)}
        disabled={items.current <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {items.uniq.map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.btn} ${p === items.current ? styles.current : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === items.current ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className={styles.btn}
        onClick={() => onPageChange(items.current + 1)}
        disabled={items.current >= items.total}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
};
