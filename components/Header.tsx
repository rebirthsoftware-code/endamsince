'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import './Header.css';

const NAV_LINKS = [
  { href: '/',           label: 'Ana Sayfa' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/hizmetler',  label: 'Hizmetler' },
  { href: '/urunler',    label: 'Ürünler' },
  { href: '/ekip',       label: 'Ekibimiz' },
  { href: '/randevu',    label: 'Randevu' },
];

export default function Header() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname                = usePathname();
  const isHeroMode = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const v = open ? 'hidden' : '';
    document.documentElement.style.overflow = v;
    document.body.style.overflow = v;
  }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className={`main-header${scrolled ? ' scrolled' : ''}${isHeroMode ? ' hero-mode' : ''}`}>
        <div className="container header-inner">
          <Link href="/" className="header-logo" aria-label="Endamsince">
            <Image
              src="/endam-logo.png"
              alt="Endamsince"
              width={200}
              height={52}
              style={{
                objectFit: 'contain',
                filter: isHeroMode ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.5s ease',
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
              className={`hamburger-btn${open ? ' open' : ''}${isHeroMode ? ' hero-mode' : ''}`}
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
