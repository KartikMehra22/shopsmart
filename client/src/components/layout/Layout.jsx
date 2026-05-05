import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import styles from './Layout.module.css';

export default function Layout() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div className={styles.main}>
        <main
          id="main-content"
          className={`${styles.content} page-transition-enter`}
          key={location.pathname}
        >
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
    </>
  );
}
