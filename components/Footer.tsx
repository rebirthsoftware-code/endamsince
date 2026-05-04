'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
          <Link href="/randevu" className="btn btn-primary btn-sm">Online Randevu</Link>
        </div>
      </div>
    </footer>
  );
}
