'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const FOOTER_HIDDEN = ['/panel', '/admin'];

export default function Footer() {
  const pathname = usePathname();
  if (FOOTER_HIDDEN.some(r => pathname === r || pathname?.startsWith(r + '/'))) {
    return null;
  }
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
            <p>
              Erkek bakımında 45 yıllık deneyim. 1979'dan bu yana Zonguldak'ın köklü berber zinciri.
            </p>
            <div className="footer-socials">
              {[
                { label: 'IG', href: '#' },
                { label: 'TW', href: '#' },
                { label: 'YT', href: '#' },
              ].map((s) => (
                <a key={s.label} href={s.href} className="footer-social">{s.label}</a>
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
              {['Saç Tasarımı', 'Sakal Şekillendirme', 'Cilt Bakımı', 'Renk Uzmanlığı', 'Klasik Tıraş'].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <p className="footer-col-title">İletişim</p>
            <ul className="footer-links">
              <li>📍 Endam Plus — Zonguldak</li>
              <li>📍 Endam Urban — Zonguldak</li>
              <li>📍 Endam Junior — Zonguldak</li>
              <li>📞 +90 (372) 123 45 67</li>
              <li>✉️ info@endamsince.com</li>
              <li>🕐 Hafta içi 09:00–21:00</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Endamsince Erkek Kuaför. Tüm hakları saklıdır.</p>
          <Link href="/randevu" className="btn btn-primary btn-sm">Online Randevu</Link>
        </div>
      </div>
    </footer>
  );
}
