'use client';
import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const CURSOR_HIDDEN = ['/panel', '/admin'];

export default function CustomCursor() {
  const pathname = usePathname();
  const hidden = CURSOR_HIDDEN.some(r => pathname === r || pathname?.startsWith(r + '/'));
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hidden) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId = 0;
    let hoverNow = false;

    // Mousemove sadece koordinat günceller (sıcak yol — kapı kapı sınıf
    // toggle'ı yapmaz). Hover algılaması ayrı pointerover/pointerout ile.
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const setHover = (state: boolean) => {
      if (state === hoverNow) return;
      hoverNow = state;
      dot.classList.toggle('hovered', state);
      ring.classList.toggle('hovered', state);
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Hover hedefi a / button / [data-cursor=hover]
      const isHover = !!t.closest('a, button, [data-cursor="hover"]');
      if (isHover) setHover(true);
    };
    const onOut = (e: PointerEvent) => {
      const related = (e.relatedTarget as HTMLElement | null);
      // Hâlâ hover edilebilir bir öğeye geçiyorsak bırak
      if (related && related.closest && related.closest('a, button, [data-cursor="hover"]')) return;
      setHover(false);
    };

    const animate = () => {
      // Ring smooth follow — dot direkt mouseX/Y'yi izler (lerp yok = anlık)
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      // translate3d donanım hızlandırması için
      dot.style.transform  = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerout',  onOut,  { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout',  onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (hidden) return null;

  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
