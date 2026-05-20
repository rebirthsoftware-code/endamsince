'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import InstallButton from './InstallButton';

const FOOTER_HIDDEN = ['/panel', '/admin'];

type Service = { id: string; name: string };
type Branch = { id: string; name: string; location: string };

export default function Footer() {
  const pathname = usePathname();
  const [dict, setDict] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/site-content').then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/services').then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/branches').then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([contentArr, servicesArr, branchesArr]) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const item of contentArr) map[item.key] = item.value;
      setDict(map);
      setServices(Array.isArray(servicesArr) ? servicesArr : []);
      setBranches(Array.isArray(branchesArr) ? branchesArr : []);
    });
    return () => { cancelled = true; };
  }, []);

  if (FOOTER_HIDDEN.some((r) => pathname === r || pathname?.startsWith(r + '/'))) {
    return null;
  }

  const v = (k: string, fb: string = '') => dict[k] || fb;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Image
              src="/endam-logo.png"
              alt="Endamsince"
              width={180}
              height={48}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            />
            <p>{v('footer.brand.tagline', "Erkek bakımında 45 yıllık deneyim. 1979'dan bu yana Zonguldak'ın köklü berber zinciri.")}</p>
            <div className="footer-socials">
              {[
                { label: 'IG', href: v('social.instagram', '#') },
                { label: 'TW', href: v('social.twitter',   '#') },
                { label: 'YT', href: v('social.youtube',   '#') },
              ].map((s) => (
                <a key={s.label} href={s.href} className="footer-social" target="_blank" rel="noopener noreferrer">{s.label}</a>
              ))}
            </div>
          </div>

          {/* Sayfalar */}
          <div>
            <p className="footer-col-title">Sayfalar</p>
            <ul className="footer-links">
              {[
                { href: '/',           label: 'Ana Sayfa' },
                { href: '/hakkimizda', label: 'Hakkımızda' },
                { href: '/hizmetler',  label: 'Hizmetler' },
                { href: '/urunler',    label: 'Ürünler' },
                { href: '/galeri',     label: 'Galeri' },
                { href: '/ekip',       label: 'Ekibimiz' },
              ].map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <p className="footer-col-title">Hizmetler</p>
            <ul className="footer-links">
              {(services.length > 0 ? services.slice(0, 5).map((s) => s.name) : ['Saç Tasarımı', 'Sakal Şekillendirme', 'Cilt Bakımı', 'Renk Uzmanlığı', 'Klasik Tıraş']).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <p className="footer-col-title">İletişim</p>
            <ul className="footer-links">
              {(branches.length > 0 ? branches : []).map((b) => (
                <li key={b.id}>📍 {b.location || b.name}</li>
              ))}
              {branches.length === 0 && (
                <>
                  <li>📍 Endam Plus — Zonguldak</li>
                  <li>📍 Endam Urban — Zonguldak</li>
                  <li>📍 Endam Junior — Zonguldak</li>
                </>
              )}
              <li>📞 {v('contact.phone', '+90 (372) 123 45 67')}</li>
              <li>✉️ {v('contact.email', 'info@endamsince.com')}</li>
              <li>🕐 {v('contact.hours', 'Hafta içi 09:00–21:00')}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{v('footer.copyright', '© 2026 Endamsince Erkek Kuaför. Tüm hakları saklıdır.')}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <InstallButton
              label="📱 Ana Ekrana Ekle"
              className="btn btn-primary btn-sm"
              title="Randevu uygulamasını ana ekrana ekle"
            />
            <Link href="/randevu" className="btn btn-primary btn-sm">Online Randevu</Link>
          </div>
        </div>

        <div className="footer-signature" aria-label="Tasarım & Geliştirme">
          <span className="footer-sig-line" aria-hidden />
          <a
            href="https://www.instagram.com/rebirthsoftware"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-sig-link"
            aria-label="Rebirth Software Instagram"
          >
            <span className="footer-sig-eyebrow">Tasarım &amp; Geliştirme</span>
            <span className="footer-sig-mark">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
                <path
                  d="M12 2 L22 7 V17 L12 22 L2 17 V7 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 16 V8 H13 A2.5 2.5 0 0 1 13 13 H9 M13 13 L16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="footer-sig-name">
                <strong>rebirth</strong>software
              </span>
            </span>
          </a>
          <span className="footer-sig-line" aria-hidden />
        </div>
      </div>
    </footer>
  );
}
