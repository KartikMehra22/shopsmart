import PropTypes from 'prop-types';
import { useId } from 'react';
import styles from './Input.module.css';

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  size = 'md',
  className = '',
  id: idProp,
  ...inputProps
}) {
  const genId = useId();
  const id = idProp || genId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={`${styles.wrap} ${styles[size] || ''} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div
        className={`${styles.field} ${error ? styles.fieldError : ''}`}
        aria-invalid={!!error}
      >
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <input
          id={id}
          className={styles.input}
          aria-describedby={[hint && !error ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined}
          aria-invalid={!!error}
          {...inputProps}
        />
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </div>
      {error && (
        <p id={errorId} className={`${styles.hint} ${styles.hintError}`} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string,
};
