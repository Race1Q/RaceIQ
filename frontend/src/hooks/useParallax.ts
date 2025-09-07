// src/hooks/useParallax.ts
import { useState, useEffect, useRef } from 'react';

export const useParallax = (speed: number) => {
  const [offsetY, setOffsetY] = useState(0);
  const scrollPosition = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      // Store the latest scroll position without causing a re-render
      scrollPosition.current = window.pageYOffset;
    };

    const updatePosition = () => {
      // Animate to the new position smoothly
      setOffsetY((currentOffsetY) => {
        // This creates a subtle "lerp" or easing effect for extra smoothness
        const distance = scrollPosition.current * speed - currentOffsetY;
        return currentOffsetY + distance * 0.1;
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    // Start the animation loop
    animationFrameId = requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return offsetY;
};
