'use client';

import { useEffect, useState } from 'react';

type Props = {
  title: string;
  body: string;
  storageKey?: string;
};

export default function HomeNotice({ title, body, storageKey = 'home-notice-v1' }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === 'dismissed') return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, [storageKey]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(storageKey, 'dismissed'); } catch {}
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-notice-title"
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        animation: 'home-notice-fade 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface, #1a1a1a)',
          color: 'var(--text-dark, #f5f5f5)',
          border: '1px solid var(--orange, #d97706)',
          maxWidth: '480px', width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '4px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          animation: 'home-notice-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          onClick={close}
          aria-label="Kapat"
          style={{
            position: 'absolute', top: '0.6rem', right: '0.8rem',
            background: 'transparent', border: 'none', color: 'inherit',
            fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, opacity: 0.6,
          }}
        >×</button>

        <div
          className="label-orange"
          style={{ fontSize: '0.6rem', letterSpacing: '0.25em', marginBottom: '1rem' }}
        >
          BİLGİLENDİRME
        </div>

        <h2
          id="home-notice-title"
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: '1.6rem', lineHeight: 1.25, marginBottom: '1.2rem',
          }}
        >
          {title}
        </h2>

        <div
          style={{
            fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.88,
            whiteSpace: 'pre-line',
          }}
        >
          {body}
        </div>

        <button
          onClick={close}
          className="btn-fill"
          style={{ marginTop: '2rem', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          ANLADIM
        </button>
      </div>

      <style>{`
        @keyframes home-notice-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes home-notice-pop {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
