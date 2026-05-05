import PropTypes from 'prop-types';
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './Modal.module.css';

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  full: styles.full,
};

export default function Modal({ open, onClose, title, size = 'md', children }) {
  const panelRef = useRef(null);
  useFocusTrap(open, panelRef);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  const titleId = 'modal-title';

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${sizeClass[size] || sizeClass.md}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div className={styles.header}>
          {title ? (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          ) : (
            <span className="sr-only">Dialog</span>
          )}
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  children: PropTypes.node,
};
