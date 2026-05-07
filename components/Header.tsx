'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import './Header.css';

const NAV_LINKS = [
  { href: '/',           label: 'Ana Sayfa' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/hizmetler',  label: 'Hizmetler' },
  { href: '/galeri',     label: 'Galeri' },
  { href: '/urunler',    label: 'Ürünler' },
  { href: '/ekip',       label: 'Ekibimiz' },
  { href: '/randevu',    label: 'Randevu' },
];

const HEADER_HIDDEN = ['/panel', '/admin'];

export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoImgRef = useRef<HTMLImageElement>(null);
  const isHomePage = useRef(false);
  const pathname = usePathname();
  const hidden = HEADER_HIDDEN.some(r => pathname === r || pathname?.startsWith(r + '/'));

  // Scroll dinleyicisi React state'i değil, direkt className manipülasyonu
  // kullanır — her scroll frame'inde re-render olmaz.
  useEffect(() => {
    if (hidden) return;
    isHomePage.current = pathname === '/';
    const header = headerRef.current;
    if (!header) return;

    let scrolled = window.scrollY > 80;
    let raf = 0;
    let pendingHeroMode = isHomePage.current && !scrolled;

    const apply = () => {
      raf = 0;
      const next = window.scrollY > 80;
      const heroMode = isHomePage.current && !next;
      if (next !== scrolled) {
        scrolled = next;
        header.classList.toggle('scrolled', scrolled);
      }
      if (heroMode !== pendingHeroMode) {
        pendingHeroMode = heroMode;
        header.classList.toggle('hero-mode', heroMode);
        // Logo invert efekti
        const logo = logoImgRef.current;
        if (logo) logo.style.filter = heroMode ? 'brightness(0) invert(1)' : 'none';
      }
    };

    // İlk durum
    header.classList.toggle('scrolled', scrolled);
    header.classList.toggle('hero-mode', pendingHeroMode);
    if (logoImgRef.current) {
      logoImgRef.current.style.filter = pendingHeroMode ? 'brightness(0) invert(1)' : 'none';
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, hidden]);

  useEffect(() => {
    const v = open ? 'hidden' : '';
    document.documentElement.style.overflow = v;
    document.body.style.overflow = v;
  }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);

  if (hidden) return null;

  // hero-mode başlangıçta SSR-uyumlu (homepage için true, diğer sayfalar için false)
  const initialHeroMode = pathname === '/';

  return (
    <>
      <header
        ref={headerRef}
        className={`main-header${initialHeroMode ? ' hero-mode' : ''}`}
      >
        <div className="container header-inner">
          <Link href="/" className="header-logo" aria-label="Endamsince">
            <Image
              ref={logoImgRef as any}
              src="/endam-logo.png"
              alt="Endamsince"
              width={200}
              height={52}
              style={{
                objectFit: 'contain',
                filter: initialHeroMode ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.4s ease',
              }}
              priority
            />
          </Link>

          <nav className="desktop-nav" aria-label="Ana Menü">
            <ul>
              {NAV_LINKS.slice(0, -1).map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={pathname === href ? 'active' : ''}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/randevu" className="btn-fill btn-fill-sm" style={{ display: 'inline-block' }}>
                  Randevu
                </Link>
              </li>
            </ul>
          </nav>

          <div className="hamburger-wrapper">
            <button
              className={`hamburger-btn${open ? ' open' : ''}${initialHeroMode ? ' hero-mode' : ''}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SCISSOR OVERLAY ── */}
      <div className={`scissor-overlay${open ? ' is-open' : ''}`} role="dialog">
        <button 
          className="overlay-close-btn" 
          onClick={() => setOpen(false)}
          aria-label="Menüyü kapat"
        >
          ✕
        </button>
        <div className="blade-top" />
        <div className="blade-bottom" />

        <nav className="overlay-nav">
          <div className="overlay-nav-links">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
          <div className="overlay-nav-right">
            <div className="overlay-detail">
              <span style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.18)', fontSize: '0.6rem', letterSpacing: '0.3em' }}>İLETİŞİM</span>
              <a href="tel:+905551234567">+90 (555) 123 45 67</a><br />
              <a href="mailto:info@endamsince.com">info@endamsince.com</a>
            </div>
            <div className="overlay-detail">
              <span style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.18)', fontSize: '0.6rem', letterSpacing: '0.3em' }}>ŞUBELER</span>
              Endam Plus · Endam Urban · Endam Junior
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
