'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';

type Item = {
  id: string;
  url: string;
  title: string | null;
  category: string | null;
  width: number | null;
  height: number | null;
};

export default function GalleryClient({ items }: { items: Item[] }) {
  /* ── Kategori filtresi ── */
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => { if (i.category) set.add(i.category); });
    return Array.from(set).sort();
  }, [items]);

  const [filter, setFilter] = useState<string | null>(null);
  const filtered = useMemo(
    () => filter ? items.filter((i) => i.category === filter) : items,
    [items, filter]
  );

  /* ── Lightbox ── */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  /* Klavye + scroll lock */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, close, prev, next]);

  if (items.length === 0) {
    return (
      <section className="gallery-empty">
        <div className="container">
          <p>Galeri yakında güncellenecek.</p>
        </div>
      </section>
    );
  }

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <>
      {/* ─── KATEGORİLER ─── */}
      {categories.length > 0 && (
        <nav className="gallery-filters">
          <div className="container gallery-filters-inner">
            <button
              className={`gallery-filter ${filter === null ? 'active' : ''}`}
              onClick={() => setFilter(null)}
            >
              Tümü <span className="gallery-filter-count">{items.length}</span>
            </button>
            {categories.map((c) => {
              const count = items.filter((i) => i.category === c).length;
              return (
                <button
                  key={c}
                  className={`gallery-filter ${filter === c ? 'active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c} <span className="gallery-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── MASONRY GRID ─── */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-masonry">
            {filtered.map((item, idx) => {
              const ratio = item.width && item.height ? item.height / item.width : 1.25;
              const span = ratio > 1.4 ? 'tall' : ratio < 0.85 ? 'wide' : 'normal';
              return (
                <button
                  key={item.id}
                  className={`gallery-tile gallery-tile-${span}`}
                  onClick={() => open(idx)}
                  aria-label={item.title || 'Galeri fotoğrafı'}
                  style={{ animationDelay: `${(idx % 12) * 60}ms` }}
                >
                  <div className="gallery-tile-img">
                    <Image
                      src={item.url}
                      alt={item.title || ''}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="gallery-tile-overlay">
                    <span className="gallery-tile-num">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {item.category && (
                      <span className="gallery-tile-cat">{item.category}</span>
                    )}
                    {item.title && (
                      <strong className="gallery-tile-title">{item.title}</strong>
                    )}
                    <span className="gallery-tile-zoom" aria-hidden>＋</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── LIGHTBOX ─── */}
      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            className="lightbox-close"
            onClick={close}
            aria-label="Kapat"
          >
            ✕
          </button>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Önceki"
          >
            ‹
          </button>

          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-img-wrap">
              <Image
                src={active.url}
                alt={active.title || ''}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            {(active.title || active.category) && (
              <div className="lightbox-meta">
                {active.category && <span className="lightbox-cat">{active.category}</span>}
                {active.title && <h2 className="lightbox-title">{active.title}</h2>}
                <span className="lightbox-counter">
                  {(lightboxIndex ?? 0) + 1} / {filtered.length}
                </span>
              </div>
            )}
          </div>

          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Sonraki"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
