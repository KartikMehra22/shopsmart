import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PageLoader from './components/PageLoader';
import Layout from './components/layout/Layout';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

const Home = lazy(() => import('./pages/Home.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function Suspensed({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route
                    path="/"
                    element={
                      <Suspensed>
                        <Home />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <Suspensed>
                        <ProductDetail />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <Suspensed>
                        <Cart />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <Suspensed>
                        <Checkout />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <Suspensed>
                        <Login />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <Suspensed>
                        <Register />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Suspensed>
                        <Profile />
                      </Suspensed>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Suspensed>
                        <NotFound />
                      </Suspensed>
                    }
                  />
                </Route>
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
