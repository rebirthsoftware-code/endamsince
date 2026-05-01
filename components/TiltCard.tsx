'use client';

import React, { useRef, useState, MouseEvent, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function TiltCard({ children, className = '', style = {} }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to card center
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate rotation (max 10 degrees)
    const rotateY = ((mouseX - width / 2) / width) * 20; 
    const rotateX = -((mouseY - height / 2) / height) * 20;
    
    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 }); // Reset rotation
  };

  return (
    <div 
      className={`tilt-container ${className}`} 
      style={{ 
        perspective: '1000px', 
        transformStyle: 'preserve-3d',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className="tilt-inner"
        style={{
          transition: isHovering ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
