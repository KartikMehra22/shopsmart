import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from './Button';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.wrap}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.desc}>{description}</p>}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          as={action.to ? Link : 'button'}
          to={action.to}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    to: PropTypes.string,
    variant: PropTypes.string,
  }),
};
