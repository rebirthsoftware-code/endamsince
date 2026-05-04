import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import HomeAnimations from '@/components/HomeAnimations';
import { getSiteContent, pick } from '@/lib/content';
import './Page.css';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function HomePage() {
  const dict = await getSiteContent();

  let branches: any[] = [];
  let personnel: any[] = [];
  let dbServices: any[] = [];
  let testimonials: any[] = [];
  let products: any[] = [];
  let stats: any[] = [];

  try {
    [branches, personnel, dbServices, testimonials, products, stats] = await Promise.all([
      prisma.branch.findMany(),
      prisma.personnel.findMany({ include: { branch: true } }),
      prisma.service.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.product.findMany({
        where: { active: true, featured: false },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        take: 3,
      }),
      prisma.stat.findMany({
        where: { active: true, group: 'home-hero' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
  } catch (error) {
    console.error('Database connection failed.', error);
  }

  // Anasayfada gösterilecek hizmet listesi
  const SERVICES = dbServices.map((s, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: s.name,
    price: s.price,
    desc: s.description || '',
  }));

  // Marquee — DB'den • ile ayrılmış metni böl ve 5 kez tekrarla
  const marqueeRaw = pick(dict, 'home.marquee', 'ERKEK BAKIMI • ZİRVE DENEYİMİ • KLASİK USTURA • MODERN KESİM • ENDAMSINCE ZONGULDAK');
  const MARQUEE = (marqueeRaw + ' • ').repeat(5).split('•');

  return (
    <>
      <HomeAnimations />
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <Image
            src="/dukkan.png"
            alt="Endamsince Barbershop Interior"
            fill
            style={{ objectFit: 'cover', objectPosition: '60% center' }}
            priority
          />
          <div className="hero-overlay" />
        </div>

        <div className="hero-top-bar container">
          <span className="label-spaced">{pick(dict, 'home.hero.label.top', 'Est. 1979 — Zonguldak')}</span>
          <span className="label-spaced">{pick(dict, 'home.hero.label.right', '[ Plus · Urban · Junior ]')}</span>
        </div>

        <div className="container hero-body">
          <div className="hero-left">
            <p className="label-orange" style={{ marginBottom: '2rem' }}>
              {pick(dict, 'home.hero.eyebrow', 'Erkek Bakımında Yeni Bir Çağ')}
            </p>
            <h1 className="h-hero" style={{ color: '#fff' }}>
              {pick(dict, 'home.hero.title.1', 'Tarzınızı')}<br />
              <em className="text-orange" style={{ fontStyle: 'italic' }}>{pick(dict, 'home.hero.title.2', 'Keskinleştirin')}</em>
            </h1>
          </div>

          <div className="hero-right">
            <div className="hero-right-line" aria-hidden />
            <div className="hero-tagline">
              <p className="hero-tagline-em">{pick(dict, 'home.hero.tagline.em', 'Sıradan bir tıraş değil,')}</p>
              <p className="hero-tagline-body">
                {pick(dict, 'home.hero.tagline.body', 'kendinize en değerli\nzaman dilimi.')
                  .split('\n')
                  .map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
              </p>
            </div>
            <div className="hero-right-divider" aria-hidden />
            <div className="hero-right-cta">
              <Link href="/randevu" className="btn-fill hero-cta-primary">
                {pick(dict, 'home.hero.cta.primary', 'Randevu Al')}
              </Link>
              <Link href="/hizmetler" className="hero-discover">
                <span>{pick(dict, 'home.hero.cta.secondary', 'Hizmetleri Keşfet')}</span>
                <span className="hero-discover-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-bottom container">
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.id} className="hero-stat">
                <span className="hero-stat-val">{s.value}</span>
                <span className="label-spaced" style={{ marginTop: '0.3rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-scroll-cue">
            <div className="scroll-line" />
            <span className="label-spaced">{pick(dict, 'home.hero.scrollcue', 'Aşağı kaydır')}</span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap" aria-hidden>
        <div className="marquee-track">
          {MARQUEE.map((t, i) => <span key={i}>{t.trim()} •</span>)}
        </div>
      </div>

      {/* INTRO */}
      <section className="section intro-section">
        <div className="container">
          <div className="intro-grid">
            <div className="intro-index">
              <span className="section-index">01 / Hakkımızda</span>
            </div>
            <div className="intro-body">
              <p className="h-section" style={{ marginBottom: '2.5rem' }}>
                {pick(dict, 'home.intro.title.1', 'Sıradan değil,')}<br />
                <em className="text-orange" style={{ fontStyle: 'italic' }}>{pick(dict, 'home.intro.title.2', 'efsanevi')}</em> {pick(dict, 'home.intro.title.3', 'bir tıraş.')}
              </p>
              <p className="intro-text">
                {pick(dict, 'home.intro.body', "1979'dan bu yana erkek bakımını bir sanat formu olarak ele alıyoruz.")}
              </p>
              <div className="intro-cta">
                <Link href="/hakkimizda" className="btn" style={{ color: 'var(--text-dark)' }}>
                  {pick(dict, 'home.intro.cta', 'Hikayemizi Oku')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {SERVICES.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="svc-header">
              <span className="section-index">02 / Hizmetler</span>
              <Link href="/hizmetler" className="btn" style={{ color: 'var(--text-dark)' }}>Tümünü Gör</Link>
            </div>
            <div className="svc-list">
              {SERVICES.map((s, i) => (
                <Link href="/hizmetler" key={i} className="svc-row">
                  <span className="svc-row-num label-spaced">{s.num}</span>
                  <span className="svc-row-title">{s.title}</span>
                  <span className="svc-row-desc label-spaced">{s.desc}</span>
                  <span className="svc-row-price">{s.price}</span>
                  <span className="svc-row-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT IMAGE SPLIT */}
      <section className="section about-split">
        <div className="about-split-img">
          <Image
            src="/dukkan.png"
            alt="Endamsince Salon"
            fill
            style={{ objectFit: 'cover', objectPosition: '40% center' }}
            sizes="50vw"
          />
          <div className="about-split-badge">
            <span className="display" style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--orange)' }}>
              {pick(dict, 'home.split.badge.value', '45+')}
            </span>
            <span className="label-spaced" style={{ marginTop: '0.3rem', fontSize: '0.58rem' }}>
              {pick(dict, 'home.split.badge.label', 'Yıllık Tecrübe')}
            </span>
          </div>
        </div>
        <div className="about-split-body">
          <span className="section-index">03 / Deneyim</span>
          <h2 className="h-section" style={{ marginBottom: '2rem' }}>
            {pick(dict, 'home.split.title.1', 'Her Detay')}<br />{pick(dict, 'home.split.title.2', 'Sizin İçin')}
          </h2>
          <p className="about-split-text">
            {pick(dict, 'home.split.body', 'Kullanılan ürünlerden sunulan ikramlara kadar her detay özenle seçildi.')}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <Link href="/hakkimizda" className="btn-fill">Daha Fazla</Link>
            <Link href="/randevu" className="btn" style={{ color: 'var(--text-dark)' }}>Randevu Al</Link>
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      {products.length > 0 && (
        <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="svc-header" style={{ marginBottom: '3rem' }}>
              <span className="section-index">04 / Ürünler</span>
              <Link href="/urunler" className="btn" style={{ color: 'var(--text-dark)' }}>Tüm Ürünler</Link>
            </div>
            <div className="prod-prev-grid">
              {products.map((p) => (
                <Link href="/urunler" key={p.id} className="prod-prev-card">
                  <div className="prod-prev-img">
                    {p.image && <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />}
                    <div className="prod-prev-overlay" />
                  </div>
                  <div className="prod-prev-body">
                    {p.tag && <span className="label-orange" style={{ fontSize: '0.58rem', marginBottom: '0.5rem', display: 'block' }}>{p.tag}</span>}
                    <h3 className="h-card">{p.name}</h3>
                    <p className="label-spaced" style={{ marginTop: '0.4rem', fontSize: '0.6rem' }}>{p.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRANCHES */}
      {branches.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="svc-header" style={{ marginBottom: '3rem' }}>
              <span className="section-index">05 / Şubeler</span>
            </div>
            <div className="branches-row">
              {branches.map((b, i) => (
                <Link href={`/randevu?branchId=${b.id}`} key={b.id} className="branch-item">
                  <div className="branch-item-img">
                    {b.image
                      ? <Image src={b.image} alt={b.name} fill style={{ objectFit: 'cover' }} />
                      : <div className="branch-ph"><span>✂</span></div>
                    }
                    <div className="branch-item-overlay" />
                  </div>
                  <div className="branch-item-body">
                    <span className="label-spaced" style={{ color: 'var(--orange)', fontSize: '0.58rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 300, margin: '0.4rem 0' }}>{b.name}</h3>
                    <p className="label-spaced" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>📍 {b.location}</p>
                    <span className="btn" style={{ color: 'var(--orange)', marginTop: '1.2rem', display: 'inline-block' }}>Randevu Al</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TEAM */}
      {personnel.length > 0 && (
        <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="svc-header" style={{ marginBottom: '3rem' }}>
              <span className="section-index">06 / Ekibimiz</span>
              <Link href="/ekip" className="btn" style={{ color: 'var(--text-dark)' }}>Tüm Ekip</Link>
            </div>
            <div className="team-row hide-scrollbar">
              {personnel.slice(0, 5).map((p) => (
                <div key={p.id} className="team-card-mini">
                  <div className="team-card-img">
                    {p.image
                      ? <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      : <div className="team-ph"><span>{p.name.charAt(0)}</span></div>
                    }
                    <div className="team-card-overlay" />
                  </div>
                  <div className="team-card-body">
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.15rem' }}>{p.name}</h3>
                    <p className="label-spaced" style={{ fontSize: '0.58rem', color: 'var(--orange)', marginTop: '0.3rem' }}>{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="section testi-section">
          <div className="container">
            <span className="section-index">07 / {pick(dict, 'home.testi.indextitle', 'Görüşler')}</span>
            <div className="testi-grid">
              {testimonials.map((t) => (
                <div key={t.id} className="testi-item">
                  <p className="testi-quote">{t.quote}</p>
                  <div className="testi-meta">
                    <span className="label-spaced" style={{ fontSize: '0.6rem' }}>{t.author}</span>
                    <span className="label-orange" style={{ fontSize: '0.58rem' }}>{t.location} Şubesi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg">
          <Image
            src="/dukkan.png"
            alt="Randevu Al"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            sizes="100vw"
          />
          <div className="cta-overlay" />
        </div>
        <div className="container cta-body">
          <p className="label-orange" style={{ marginBottom: '2rem' }}>{pick(dict, 'home.cta.eyebrow', 'Online Rezervasyon')}</p>
          <h2 className="h-section" style={{ color: '#fff', marginBottom: '3rem' }}>
            {pick(dict, 'home.cta.title.1', 'Randevunuzu')}<br />
            <em style={{ fontStyle: 'italic', color: 'var(--orange)' }}>{pick(dict, 'home.cta.title.2', 'Hemen Alın')}</em>
          </h2>
          <Link href="/randevu" className="btn-fill" style={{ fontSize: '0.75rem' }}>
            {pick(dict, 'home.cta.button', 'Randevu Oluştur')}
          </Link>
        </div>
      </section>
    </>
  );
}
