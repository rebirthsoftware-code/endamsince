'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import './LoadingScreen.css';

type Phase = 'loading' | 'title' | 'scissors' | 'scissors-open' | 'done';

/** Loading ekranının gösterilmediği rotalar (PWA/standalone deneyim için) */
const SKIP_ROUTES = ['/panel', '/admin'];

export default function LoadingScreen() {
  const pathname = usePathname();
  const skip = SKIP_ROUTES.some(r => pathname === r || pathname?.startsWith(r + '/'));

  const [count,   setCount]   = useState(1);
  const [phase,   setPhase]   = useState<Phase>('loading');
  const [clicked, setClicked] = useState(false);

  const bgImgRef = useRef<HTMLDivElement>(null);

  /* ── Scroll lock: html + body ikisine de uygula (tarayıcı farkları) ── */
  useEffect(() => {
    if (skip) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [skip]);

  /* ── Phase 1: counter 0→100 in ~2.5s, sonra title — arada nefes payı
        bırakarak anasayfa hidrasyonu + image decode'unun bitmesini bekleriz.
        Ek olarak hero arka planını (/dukkan.png) önceden decode ederek
        scissors-open anında karaltı/jank engellenir. ── */
  useEffect(() => {
    const DURATION = 2500;
    // Hero image'ini paralelde önceden yükle ve decode et
    if (typeof window !== 'undefined') {
      const pre = new window.Image();
      pre.src = '/dukkan.png';
      // decode hata verirse de yutulsun
      pre.decode?.().catch(() => {});
    }

    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / DURATION, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.round(e * 100));
      if (p >= 1) {
        clearInterval(id);
        // Sayaç 100% olduktan sonra ~1.6 sn ekstra hold:
        // - hidrasyon, GSAP init, ScrollTrigger kayıtları, image decode
        //   bu süre içinde bitiyor — title'a geçince kullanıcı kaydırdığında
        //   hero animasyonu için her şey hazır.
        setTimeout(() => setPhase('title'), 1600);
      }
    }, 16);
    return () => clearInterval(id);
  }, []);

  /* ── Title → makas animasyonu → kapanış ── */
  const startTransition = useCallback(() => {
    if (clicked) return;
    setClicked(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setPhase('scissors');
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setPhase('scissors-open');
    }, 900);
    setTimeout(() => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setPhase('done');
      window.dispatchEvent(new Event('ls:done'));
    }, 1820);
  }, [clicked]);

  /* ── Title ekranında kaydırma (wheel/touch) animasyonu tetiklesin ── */
  useEffect(() => {
    if (phase !== 'title') return;

    let touchStartY = 0;
    const onWheel = (e: WheelEvent) => {
      // Aşağı kaydırma → animasyonu başlat
      if (e.deltaY > 4) startTransition();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = (e.touches[0]?.clientY ?? 0) - touchStartY;
      if (dy < -16) startTransition(); // yukarı sürükle → aşağı kaydırma
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'Space', 'Enter'].includes(e.code)) startTransition();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, startTransition]);

  /* ── Mouse parallax + blur on title screen ── */
  useEffect(() => {
    if (phase !== 'title') return;
    const el = bgImgRef.current;
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth  - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy);
      el.style.transform = `translate(${cx * 18}px, ${cy * 12}px)`;
      el.style.filter    = `blur(${2 + dist * 16}px)`;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [phase]);

  if (skip || phase === 'done') return null;

  return (
    <div
      className="ls-root"
      style={{
        cursor: 'default',
        /* During re-open: make bg transparent so site shows behind blades */
        background: phase === 'scissors-open' ? 'transparent' : '#060606',
        pointerEvents: phase === 'scissors-open' ? 'none' : 'all',
      }}
      aria-hidden
    >

      {/* ══════════════════════════════════════════
          PHASE 1 — LOADING  (sinematik)
      ══════════════════════════════════════════ */}
      {phase === 'loading' && (
        <div className="ls-loading">
          {/* Atmospheric grain overlay */}
          <div className="ls-grain" aria-hidden />

          {/* Horizontal scan line */}
          <div className="ls-scanline" aria-hidden />

          {/* Corner marks — like a film viewfinder */}
          <div className="ls-corner ls-c-tl" aria-hidden />
          <div className="ls-corner ls-c-tr" aria-hidden />
          <div className="ls-corner ls-c-bl" aria-hidden />
          <div className="ls-corner ls-c-br" aria-hidden />

          {/* CENTER: logo clip-reveal from bottom */}
          <div className="ls-logo-clip">
            <div className="ls-logo-inner">
              <Image
                src="/endam-logo.png"
                alt="Endamsince"
                width={320}
                height={84}
                priority
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </div>
          </div>

          {/* Divider line */}
          <div className="ls-divider" aria-hidden />

          {/* Counter — large, dramatic */}
          <div className="ls-counter-wrap">
            {/* suppressHydrationWarning: SSR renders '000', client updates via setInterval */}
            <span className="ls-counter-num" suppressHydrationWarning>
              {String(count).padStart(3, '0')}
            </span>
            <span className="ls-counter-pct">%</span>
          </div>

          {/* Thin progress line along bottom */}
          <div className="ls-progress-bar">
            <div className="ls-progress-fill" />
          </div>

          {/* Bottom detail row */}
          <div className="ls-loading-footer">
            <span className="ls-footer-text">ENDAMSINCE 1979</span>
            <span className="ls-footer-text">[ PLUS · URBAN · JUNIOR ]</span>
            <span className="ls-footer-text">ZONGULDAK</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PHASE 3 — TITLE + SCISSORS
          title: full screen image + text
          scissors: blades close
          scissors-open: blades open (bg hidden → site shows through)
      ══════════════════════════════════════════ */}
      {(phase === 'title' || phase === 'scissors' || phase === 'scissors-open') && (
        <div className="ls-title-phase">
          {/* Bg image — hidden when scissors are opening (site shows through) */}
          {phase !== 'scissors-open' && (
            <div className="ls-title-bg-wrap">
              <div
                ref={bgImgRef}
                className="ls-title-bg-img"
                style={{ filter: 'blur(3px)' }}
              >
                <Image
                  src="/dukkan.png"
                  alt="Endamsince Barbershop"
                  fill
                  priority
                  style={{ objectFit: 'cover', objectPosition: '60% center' }}
                  sizes="100vw"
                />
              </div>
              <div className="ls-title-overlay" />
            </div>
          )}

          {/* ─── SCISSOR BLADES ─── */}
          <div className={[
            'ls-scissor-top',
            (phase === 'scissors' || phase === 'scissors-open') ? 'ls-sc-visible' : '',
            phase === 'scissors'      ? 'ls-sc-close'    : '',
            phase === 'scissors-open' ? 'ls-sc-open-top' : '',
          ].join(' ')} />
          <div className={[
            'ls-scissor-bottom',
            (phase === 'scissors' || phase === 'scissors-open') ? 'ls-sc-visible' : '',
            phase === 'scissors'      ? 'ls-sc-close'    : '',
            phase === 'scissors-open' ? 'ls-sc-open-bot' : '',
          ].join(' ')} />

          {/* Content — hidden when scissors opening */}
          {phase !== 'scissors-open' && (
            <div className="ls-title-content">
              {/* Logo: sits between screen top and center text */}
              <div className="ls-title-logo">
                <Image
                  src="/endam-logo.png"
                  alt="Endamsince"
                  width={500}
                  height={130}
                  style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
                />
              </div>

              <div className="ls-title-center">
                <h1 className="ls-title-name">ENDAMSINCE</h1>
                <p className="ls-title-year">1979</p>
                <p className="ls-title-sub">
                  [ Plus &nbsp;&middot;&nbsp; Urban &nbsp;&middot;&nbsp; Junior ]
                </p>
              </div>

              <div className="ls-click-cue">
                <span className="ls-click-text">Devam etmek için aşağı kaydırın</span>
                <div className="ls-scroll-arrow" aria-hidden>↓</div>
              </div>

              <div className="ls-title-bl">
                <span className="ls-title-detail">Est. 1979 — Zonguldak</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
