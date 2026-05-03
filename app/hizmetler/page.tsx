import type { Metadata } from 'next';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import './hizmetler.css';

export const metadata: Metadata = {
  title: 'Hizmetler',
  description: 'Endamsince\'nin sunduğu premium erkek bakım hizmetleri. Saç kesimi, sakal tıraşı, cilt bakımı ve daha fazlası.',
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

type DbService = {
  id: string; name: string; price: string; duration: string;
  description: string; features: string[]; icon: string;
  popular: boolean; active: boolean; order: number;
};

async function getServices(): Promise<DbService[]> {
  try {
    return await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  } catch (err) {
    console.error('Hizmetler yüklenemedi:', err);
    return [];
  }
}

const PACKAGES = [
  {
    name: 'Basic',
    price: '450₺',
    icon: '✂️',
    services: ['Saç Kesimi', 'Sakal Şekillendirme', 'Şampuan & Kurutma'],
    popular: false,
    color: 'var(--surface)',
  },
  {
    name: 'Premium',
    price: '780₺',
    icon: '💈',
    services: ['Saç Kesimi', 'Klasik Ustura Tıraşı', 'Sakal Şekillendirme', 'Yüz Bakımı', 'Şampuan & Masaj'],
    popular: true,
    color: 'var(--orange)',
  },
  {
    name: 'VIP',
    price: '1.200₺',
    icon: '👑',
    services: ['Tüm Premium Hizmetler', 'Renk Uygulaması', 'Keratin Bakımı', 'VIP Lounge', 'İçecek İkramı'],
    popular: false,
    color: 'var(--text-dark)',
  },
];

export default async function HizmetlerPage() {
  const services = await getServices();

  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">Ne Sunuyoruz</span>
          <h1>Premium <span className="text-orange">Hizmetlerimiz</span></h1>
          <p>Erkek bakımında sınırları zorluyoruz. Her hizmet uzman eller ve kaliteli ürünlerle sunulur.</p>
        </div>
      </div>

      {/* ─── SERVICES LIST ─── */}
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
                    {s.features.map((f, i) => (
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

      {/* ─── PACKAGES ─── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Paketler</p>
            <h2 className="h2">Kombine <span className="text-orange">Paketler</span></h2>
            <p className="text-muted" style={{ marginTop: '0.8rem' }}>Birden fazla hizmeti birleştirerek daha avantajlı fiyatlardan yararlanın.</p>
          </div>
          <div className="packages-grid">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`pkg-card ${pkg.popular ? 'pkg-popular' : ''}`}>
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

      {/* ─── FAQ ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Sıkça Sorulanlar</p>
            <h2 className="h2">Merak <span className="text-orange">Ettikleriniz</span></h2>
          </div>
          <div className="faq-list">
            {[
              { q: 'Randevu almak zorunlu mu?', a: 'Randevu almanızı öneririz ancak müsaitlik durumuna göre randevusuz müşteriler de kabul edilir.' },
              { q: 'Çocuklar için hizmet var mı?', a: 'Evet, 6 yaş ve üzeri çocuklar için özel indirimli saç kesimi hizmetimiz mevcuttur.' },
              { q: 'Hangi ödeme yöntemleri kabul ediliyor?', a: 'Nakit, kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz.' },
              { q: 'Alerji veya hassasiyetim var, bildirebilir miyim?', a: 'Kesinlikle. Randevu öncesi stilistinizi bilgilendirmenizi öneririz.' },
            ].map((item, i) => (
              <div key={i} className="faq-item card">
                <h3 className="faq-q">{item.q}</h3>
                <p className="faq-a text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
