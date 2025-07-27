'use client';
import { useEffect } from 'react';

/**
 * Заменяет inline <script dangerouslySetInnerHTML> в layout.tsx.
 * Безопасно, без nonce, под CSP 'script-src self'.
 */
export default function ViewportFix() {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
  return null;
}
