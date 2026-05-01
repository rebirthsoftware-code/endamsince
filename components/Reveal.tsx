'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export default function Reveal({ children, className = '', delay = 0, direction = 'up' }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.15,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  let transformInitial = 'translateY(40px)';
  if (direction === 'down') transformInitial = 'translateY(-40px)';
  if (direction === 'left') transformInitial = 'translateX(40px)';
  if (direction === 'right') transformInitial = 'translateX(-40px)';
  if (direction === 'none') transformInitial = 'translate(0)';

  return (
    <div 
      ref={ref} 
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : transformInitial,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
