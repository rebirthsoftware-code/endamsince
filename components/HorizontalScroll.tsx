'use client';

import React, { useRef, useEffect } from 'react';
import './HorizontalScroll.css';

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export default function HorizontalScroll({ children }: HorizontalScrollProps) {
  const outerRef  = useRef<HTMLDivElement>(null);  // tall wrapper — provides scroll height
  const stickyRef = useRef<HTMLDivElement>(null);  // the 100vh sticky viewport
  const trackRef  = useRef<HTMLDivElement>(null);  // the horizontal track that slides

  useEffect(() => {
    let rafId: number;
    let current = 0; // current translated X (px)
    let target  = 0; // desired translated X (px)

    const update = () => {
      if (!outerRef.current || !trackRef.current) {
        rafId = requestAnimationFrame(update);
        return;
      }

      const outer  = outerRef.current.getBoundingClientRect();
      const trackW = trackRef.current.scrollWidth;
      const winW   = window.innerWidth;
      const maxX   = Math.max(0, trackW - winW);

      // How far we've scrolled into the outer tall container
      const scrolled  = Math.max(0, -outer.top);
      const available = outer.height - window.innerHeight;
      const progress  = available > 0 ? Math.min(scrolled / available, 1) : 0;

      target = progress * maxX;

      // Lerp for butter smoothness (0.085 = silky, like butter)
      current += (target - current) * 0.085;

      trackRef.current.style.transform = `translate3d(${-current}px, 0, 0)`;

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={outerRef} className="hs-outer">
      <div ref={stickyRef} className="hs-sticky">
        <div ref={trackRef} className="hs-track">
          {children}
        </div>
      </div>
    </div>
  );
}
