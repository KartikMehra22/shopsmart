import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 640,
  lg: 768,
  xl: 1024,
  '2xl': 1280,
  '3xl': 1536,
};

export function useBreakpoint() {
  const [bp, setBp] = useState(() => getBp(typeof window !== 'undefined' ? window.innerWidth : 1280));

  useEffect(() => {
    const onResize = () => setBp(getBp(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    name: bp,
    isXs: bp === 'xs',
    isSm: bp === 'sm',
    isMd: bp === 'md',
    isLg: bp === 'lg',
    isXl: bp === 'xl',
    is2xl: bp === '2xl',
    is3xl: bp === '3xl',
    isMobile: BREAKPOINTS[bp] < BREAKPOINTS.lg,
  };
}

function getBp(width) {
  if (width >= BREAKPOINTS['3xl']) return '3xl';
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}
