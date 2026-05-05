import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.code} aria-hidden>
        404
      </div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.desc}>
        The page you are looking for may have moved. Try these links instead.
      </p>
      <nav className={styles.links} aria-label="Helpful links">
        <Link to="/">Home</Link>
        <Link to="/#collections">Categories</Link>
        <Link to="/cart">Cart</Link>
      </nav>
    </div>
  );
}
