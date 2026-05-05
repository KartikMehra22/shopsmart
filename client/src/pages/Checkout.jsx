import { Link } from 'react-router-dom';
import styles from './Checkout.module.css';

export default function Checkout() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Checkout</h1>
      <p className={styles.text}>
        This demo does not process payments. In production, connect your PSP and confirm orders on
        the server.
      </p>
      <Link to="/cart" className={styles.link}>
        Back to cart
      </Link>
    </div>
  );
}
