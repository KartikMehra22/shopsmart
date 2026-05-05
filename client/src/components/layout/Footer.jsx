import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <p className={styles.brand}>ShopSmart</p>
          <p className={styles.tag}>
            Cinematic shopping for those who value craft, detail, and calm.
          </p>
        </div>
        <div className={styles.col}>
          <h3>Shop</h3>
          <ul>
            <li>
              <Link to="/#featured">Featured</Link>
            </li>
            <li>
              <Link to="/#collections">Collections</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
          </ul>
        </div>
        <div className={styles.col}>
          <h3>Support</h3>
          <ul>
            <li>
              <a href="#help">Help Center</a>
            </li>
            <li>
              <a href="#shipping">Shipping</a>
            </li>
            <li>
              <a href="#returns">Returns</a>
            </li>
          </ul>
        </div>
        <div className={styles.col}>
          <h3>Stay in touch</h3>
          <p className={styles.tag}>Newsletter with drops and edits—no clutter.</p>
          <form
            className={styles.newsletter}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input id="footer-email" type="email" placeholder="Email address" required />
            <Button type="submit" variant="primary" size="sm">
              Subscribe
            </Button>
          </form>
          <div className={styles.social}>
            <a href="#x" aria-label="Social link">
              𝕏
            </a>
            <a href="#in" aria-label="Social link">
              in
            </a>
            <a href="#ig" aria-label="Social link">
              ◎
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© 2025 ShopSmart</span>
        <span>
          <Link to="#privacy">Privacy</Link>
          <Link to="#terms">Terms</Link>
          <Link to="#sitemap">Sitemap</Link>
        </span>
      </div>
    </footer>
  );
}
