import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useReducedMotion() {
  const setReducedMotion = useStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setReducedMotion]);
}
