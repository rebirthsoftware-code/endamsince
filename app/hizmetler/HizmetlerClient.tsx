'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Service = {
  id: string;
  name: string;
  icon: string;
  duration: string;
  description: string;
  features: string[];
  popular: boolean;
  defaultPrice: string;
  pricesByBranch: Record<string, string>;
};
type Package = {
  id: string;
  name: string;
  price: string;
  icon: string;
  services: string[];
  popular: boolean;
};
type Faq = { id: string; question: string; answer: string };
type Branch = { id: string; name: string; location: string };

function pick(dict: Record<string, string>, key: string, fb: string) {
  const v = dict[key];
  return v === undefined || v === '' ? fb : v;
}

export default function HizmetlerClient({
  services, packages, faqs, branches, dict,
}: {
  services: Service[];
  packages: Package[];
  faqs: Faq[];
  branches: Branch[];
  dict: Record<string, string>;
}) {
  const [selectedBranch, setSelectedBranch] = useState<string>(
    branches[0]?.id || ''
  );

  const visibleServices = useMemo(() => {
    return services.map((s) => ({
      ...s,
      shownPrice: selectedBranch && s.pricesByBranch[selectedBranch]
        ? s.pricesByBranch[selectedBranch]
        : s.defaultPrice,
    }));
  }, [services, selectedBranch]);

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

      {/* BRANCH SELECTOR */}
      {branches.length > 1 && (
        <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: 0 }}>
          <div className="container">
            <div className="branch-tabs">
              <span className="branch-tabs-label">Şube:</span>
              <div className="branch-tabs-list">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranch(b.id)}
                    className={`branch-tab ${selectedBranch === b.id ? 'active' : ''}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES LIST */}
      <section className="section">
        <div className="container">
          <div className="services-detail-grid">
            {visibleServices.length === 0 ? (
              <p className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
                Hizmetler yakında güncellenecek.
              </p>
            ) : visibleServices.map((s) => (
              <div key={s.id} className={`svc-detail-card card ${s.popular ? 'svc-popular' : ''}`}>
                {s.popular && <div className="svc-popular-badge">En Popüler</div>}
                <div className="svc-detail-head">
                  <span className="svc-detail-icon">{s.icon}</span>
                  <div>
                    <h3>{s.name}</h3>
                    <div className="svc-meta">
                      {s.duration && <span>⏱ {s.duration}</span>}
                      <span className="text-orange svc-detail-price">{s.shownPrice}</span>
                    </div>
                  </div>
                </div>
                {s.description && <p className="svc-detail-desc text-muted">{s.description}</p>}
                {s.features.length > 0 && (
                  <ul className="svc-features">
                    {s.features.map((f, i) => (
                      <li key={i}><span className="check">✓</span>{f}</li>
                    ))}
                  </ul>
                )}
                <Link
                  href={`/randevu?branchId=${selectedBranch}`}
                  className={`btn btn-sm ${s.popular ? 'btn-primary' : 'btn-outline'}`}
                  style={{ marginTop: 'auto' }}
                >
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
              <p className="text-muted" style={{ marginTop: '0.8rem' }}>
                {pick(dict, 'hizmetler.pkg.body', 'Birden fazla hizmeti birleştirerek daha avantajlı fiyatlardan yararlanın.')}
              </p>
            </div>
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`pkg-card ${pkg.popular ? 'pkg-popular' : ''}`}>
                  {pkg.popular && <div className="pkg-badge">En Çok Tercih</div>}
                  <div className="pkg-icon">{pkg.icon}</div>
                  <h3 className="pkg-name">{pkg.name}</h3>
                  <div className="pkg-price">{pkg.price}</div>
                  <ul className="pkg-list">
                    {pkg.services.map((svc) => (
                      <li key={svc}><span className="check">✓</span>{svc}</li>
                    ))}
                  </ul>
                  <Link
                    href={`/randevu?branchId=${selectedBranch}`}
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
