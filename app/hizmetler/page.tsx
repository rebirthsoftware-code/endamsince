import type { Metadata } from 'next';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getSiteContent, pick } from '@/lib/content';
import './hizmetler.css';

export const metadata: Metadata = {
  title: 'Hizmetler',
  description: 'Endamsince\'nin sunduğu premium erkek bakım hizmetleri.',
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function HizmetlerPage() {
  const dict = await getSiteContent('hizmetler');

  let services: any[] = [];
  let packages: any[] = [];
  let faqs: any[] = [];

  try {
    [services, packages, faqs] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.package.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.faq.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
  } catch (err) {
    console.error('Hizmetler içerik yüklenemedi:', err);
  }

  return (
    <>
      {/* HERO */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">{pick(dict, 'hizmetler.hero.eyebrow', 'Ne Sunuyoruz')}</span>
          <h1>
            {pick(dict, 'hizmetler.hero.title.1', 'Premium')}{' '}
            <span className="text-orange">{pick(dict, 'hizmetler.hero.title.2', 'Hizmetlerimiz')}</span>
          </h1>
          <p>{pick(dict, 'hizmetler.hero.body', 'Erkek bakımında sınırları zorluyoruz.')}</p>
        </div>
      </div>

      {/* SERVICES LIST */}
      <section className="section">
        <div className="container">
          <div className="services-detail-grid">
            {services.length === 0 ? (
              <p className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
                Hizmetler yakında güncellenecek.
              </p>
            ) : services.map((s) => (
              <div key={s.id} className={`svc-detail-card card ${s.popular ? 'svc-popular' : ''}`}>
                {s.popular && <div className="svc-popular-badge">En Popüler</div>}
                <div className="svc-detail-head">
                  <span className="svc-detail-icon">{s.icon}</span>
                  <div>
                    <h3>{s.name}</h3>
                    <div className="svc-meta">
                      {s.duration && <span>⏱ {s.duration}</span>}
                      <span className="text-orange svc-detail-price">{s.price}</span>
                    </div>
                  </div>
                </div>
                {s.description && <p className="svc-detail-desc text-muted">{s.description}</p>}
                {s.features.length > 0 && (
                  <ul className="svc-features">
                    {s.features.map((f: string, i: number) => (
                      <li key={i}><span className="check">✓</span>{f}</li>
                    ))}
                  </ul>
                )}
                <Link href="/randevu" className={`btn btn-sm ${s.popular ? 'btn-primary' : 'btn-outline'}`} style={{ marginTop: 'auto' }}>
                  Randevu Al
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      {packages.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'hizmetler.pkg.eyebrow', 'Paketler')}</p>
              <h2 className="h2">
                {pick(dict, 'hizmetler.pkg.title.1', 'Kombine')}{' '}
                <span className="text-orange">{pick(dict, 'hizmetler.pkg.title.2', 'Paketler')}</span>
              </h2>
              <p className="text-muted" style={{ marginTop: '0.8rem' }}>{pick(dict, 'hizmetler.pkg.body', 'Birden fazla hizmeti birleştirerek daha avantajlı fiyatlardan yararlanın.')}</p>
            </div>
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`pkg-card ${pkg.popular ? 'pkg-popular' : ''}`}>
                  {pkg.popular && <div className="pkg-badge">En Çok Tercih</div>}
                  <div className="pkg-icon">{pkg.icon}</div>
                  <h3 className="pkg-name">{pkg.name}</h3>
                  <div className="pkg-price">{pkg.price}</div>
                  <ul className="pkg-list">
                    {pkg.services.map((svc: string) => (
                      <li key={svc}><span className="check">✓</span>{svc}</li>
                    ))}
                  </ul>
                  <Link
                    href="/randevu"
                    className={`btn btn-lg ${pkg.popular ? '' : 'btn-outline'}`}
                    style={pkg.popular ? { background: 'var(--orange)', color: '#fff', border: 'none', width: '100%', justifyContent: 'center' } : { width: '100%', justifyContent: 'center' }}
                  >
                    Seç & Randevu Al
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'hizmetler.faq.eyebrow', 'Sıkça Sorulanlar')}</p>
              <h2 className="h2">
                {pick(dict, 'hizmetler.faq.title.1', 'Merak')}{' '}
                <span className="text-orange">{pick(dict, 'hizmetler.faq.title.2', 'Ettikleriniz')}</span>
              </h2>
            </div>
            <div className="faq-list">
              {faqs.map((item) => (
                <div key={item.id} className="faq-item card">
                  <h3 className="faq-q">{item.question}</h3>
                  <p className="faq-a text-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
