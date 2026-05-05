/* eslint-disable react-refresh/only-export-components -- paired provider + hook */
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import styles from '../components/ui/Toast.module.css';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', durationMs = 4000) => {
      const id = ++idSeq;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (durationMs > 0) {
        const t = setTimeout(() => remove(id), durationMs);
        timers.current.set(id, t);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      toast: {
        success: (m, d) => push(m, 'success', d),
        error: (m, d) => push(m, 'error', d),
        warning: (m, d) => push(m, 'warning', d),
        info: (m, d) => push(m, 'info', d),
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" aria-relevant="additions text">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type] || styles.info}`}
            role="status"
          >
            <p className={styles.message}>{t.message}</p>
            <button
              type="button"
              className={styles.dismiss}
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node,
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast requires ToastProvider');
  return ctx.toast;
}
