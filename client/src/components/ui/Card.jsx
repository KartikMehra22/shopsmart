import PropTypes from 'prop-types';
import styles from './Card.module.css';

const paddings = { sm: styles.padSm, md: styles.padMd, lg: styles.padLg };

export default function Card({
  children,
  hoverable = false,
  selected = false,
  padding = 'md',
  as: Comp = 'div',
  className = '',
  ...rest
}) {
  const pad = paddings[padding] || paddings.md;
  return (
    <Comp
      className={[
        styles.card,
        hoverable && styles.hoverable,
        selected && styles.selected,
        pad,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Comp>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  hoverable: PropTypes.bool,
  selected: PropTypes.bool,
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  as: PropTypes.elementType,
  className: PropTypes.string,
};
