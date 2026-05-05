import { useEffect } from 'react';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active, rootRef) {
  useEffect(() => {
    if (!active || !rootRef.current) return undefined;

    const root = rootRef.current;
    const focusables = () =>
      Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );

    const first = () => focusables()[0];

    const t = requestAnimationFrame(() => {
      first()?.focus();
    });

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    root.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(t);
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [active, rootRef]);
}
