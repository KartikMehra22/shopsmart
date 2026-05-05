import PropTypes from 'prop-types';
import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const v = styles[variant] || styles.default;
  const s = styles[size] || styles.md;
  return <span className={`${styles.badge} ${v} ${s} ${className}`}>{children}</span>;
}

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'brand']),
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
};
