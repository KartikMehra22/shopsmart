/* eslint-disable react-refresh/only-export-components -- paired provider + hook */
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

function lineKey(productId, variantKey) {
  return `${productId}::${variantKey || 'default'}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback((product, opts = {}) => {
    const { qty = 1, variantKey = 'default', variantLabel = '' } = opts;
    setLines((prev) => {
      const key = lineKey(product.id, variantKey);
      const i = prev.findIndex((l) => l.key === key);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          key,
          product,
          qty,
          variantKey,
          variantLabel,
        },
      ];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: Math.max(1, qty) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.qty, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      drawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      itemCount,
      subtotal,
    }),
    [lines, drawerOpen, addItem, removeItem, updateQty, clearCart, itemCount, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node,
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart requires CartProvider');
  return ctx;
}
