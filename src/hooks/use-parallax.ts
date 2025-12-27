import { useState, useEffect, useCallback } from 'react';

interface ParallaxState {
  scrollY: number;
  offsetY: (speed?: number) => number;
  opacity: (fadeStart?: number, fadeEnd?: number) => number;
  scale: (baseScale?: number, scaleSpeed?: number) => number;
}

export function useParallax(): ParallaxState {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const offsetY = useCallback((speed: number = 0.5) => {
    return scrollY * speed;
  }, [scrollY]);

  const opacity = useCallback((fadeStart: number = 0, fadeEnd: number = 400) => {
    if (scrollY <= fadeStart) return 1;
    if (scrollY >= fadeEnd) return 0;
    return 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
  }, [scrollY]);

  const scale = useCallback((baseScale: number = 1, scaleSpeed: number = 0.0005) => {
    return Math.max(baseScale - scrollY * scaleSpeed, 0.8);
  }, [scrollY]);

  return { scrollY, offsetY, opacity, scale };
}
