import PropTypes from 'prop-types';
import { forwardRef, useCallback } from 'react';
import styles from './Button.module.css';

function Spinner() {
  return (
    <svg
      className={styles.spinner}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32 48"
      />
    </svg>
  );
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    as: Comp = 'button',
    className = '',
    children,
    onClick,
    bounceOnClick = false,
    type = 'button',
    to,
    href,
    ...rest
  },
  ref
) {
  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    },
    [loading, disabled, onClick]
  );

  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.md;
  const classes = [
    styles.btn,
    variantClass,
    sizeClass,
    fullWidth && styles.fullWidth,
    (loading || disabled) && styles.btnDisabled,
    loading && styles.btnLoading,
    bounceOnClick && styles.bounceClick,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const extra =
    Comp === 'button'
      ? { type, disabled: disabled || loading, ref, ...rest }
      : { ref, ...(to != null ? { to } : {}), ...(href != null ? { href } : {}), ...rest };

  return (
    <Comp
      className={classes}
      onClick={handleClick}
      aria-busy={loading || undefined}
      {...extra}
    >
      {loading ? <Spinner /> : leftIcon}
      {!loading && children}
      {!loading && rightIcon}
    </Comp>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  as: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  bounceOnClick: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  to: PropTypes.string,
  href: PropTypes.string,
};

export default Button;
