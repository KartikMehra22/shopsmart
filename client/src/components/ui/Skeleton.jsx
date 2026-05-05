import PropTypes from 'prop-types';
import styles from './Skeleton.module.css';

const variants = {
  text: styles.text,
  rect: styles.rect,
  circle: styles.circle,
  card: styles.card,
};

export default function Skeleton({
  width,
  height,
  variant = 'rect',
  className = '',
  style: styleProp,
}) {
  const style = {
    ...styleProp,
    ...(width != null ? { width } : {}),
    ...(height != null ? { height } : {}),
  };
  return (
    <span
      className={`${styles.skeleton} ${variants[variant] || styles.rect} ${className}`}
      style={style}
      aria-hidden
    />
  );
}

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf(['text', 'rect', 'circle', 'card']),
  className: PropTypes.string,
  style: PropTypes.object,
};
