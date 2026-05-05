/* eslint-disable react-refresh/only-export-components -- paired provider + hook */
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());

  const toggle = useCallback((productId) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const has = useCallback((productId) => ids.has(productId), [ids]);

  const count = ids.size;

  const value = useMemo(
    () => ({
      ids,
      toggle,
      has,
      count,
    }),
    [ids, toggle, has, count]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

WishlistProvider.propTypes = {
  children: PropTypes.node,
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist requires WishlistProvider');
  return ctx;
}
