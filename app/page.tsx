import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import HomeAnimations from '@/components/HomeAnimations';
import './Page.css';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const MARQUEE = "ERKEK BAKIMI • ZİRVE DENEYİMİ • KLASİK USTURA • MODERN KESİM • ENDAMSINCE ZONGULDAK • ".repeat(5).split('•');

const SERVICES = [
  { num: '01', title: 'Saç Tasarımı',          price: '₺350', desc: 'Yüz hatlarınıza özel modern kesimler.' },
  { num: '02', title: 'Klasik Tıraş',          price: '₺280', desc: 'Geleneksel ustura ritueli.' },
  { num: '03', title: 'Sakal Şekillendirme',   price: '₺200', desc: 'Ustura & modern teknikler.' },
  { num: '04', title: 'Derin Yüz Bakımı',      price: '₺450', desc: 'Erkek cildine özel bakım.' },
];

const PRODUCTS_PREVIEW = [
  { name: 'Black Gold Wax', sub: 'Güçlü Tutuş', img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&q=85', badge: 'En Çok Satan' },
  { name: 'Sakal Yağı',     sub: 'Argan + Jojoba', img: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=600&q=85', badge: 'Yeni' },
  { name: 'Altın Serum',    sub: 'Keratin Kompleks', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=85', badge: 'Premium' },
];

export default async function HomePage() {
  let branches: any[] = [];
  let personnel: any[] = [];

  try {
    branches  = await prisma.branch.findMany();
    personnel = await prisma.personnel.findMany({ include: { branch: true } });
  } catch (error) {
    console.error("Database connection failed. Showing fallback content.", error);
    // Fallback data if DB is not reachable
    branches = [
      { id: 'f1', name: 'Zonguldak Merkez', location: 'Zonguldak, Merkez' },
      { id: 'f2', name: 'Ereğli Şube', location: 'Zonguldak, Ereğli' }
    ];
  }

  return (
    <>
      <HomeAnimations />
      {/* ══════════════════════════════
          HERO — FULL SCREEN
      ══════════════════════════════ */}
      <section className="hero">
        {/* BG Image */}
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

        {/* Top label */}
        <div className="hero-top-bar container">
          <span className="label-spaced">Est. 1979 — Zonguldak</span>
          <span className="label-spaced">[ Plus · Urban · Junior ]</span>
        </div>

        {/* Main text */}
        <div className="container hero-body">
          <div className="hero-left">
            <p className="label-orange" style={{ marginBottom: '2rem' }}>
              Erkek Bakımında Yeni Bir Çağ
            </p>
            <h1 className="h-hero" style={{ color: '#fff' }}>
              Tarzınızı<br />
              <em className="text-orange" style={{ fontStyle: 'italic' }}>Keskinleştirin</em>
            </h1>
          </div>

          <div className="hero-right">
            {/* Animated orange line */}
            <div className="hero-right-line" aria-hidden />

            {/* Large serif tagline — the main editorial statement */}
            <div className="hero-tagline">
              <p className="hero-tagline-em">
                Sıradan bir tıraş değil,
              </p>
              <p className="hero-tagline-body">
                kendinize en değerli<br />zaman dilimi.
              </p>
            </div>

            {/* Divider */}
            <div className="hero-right-divider" aria-hidden />

            {/* CTA stack */}
            <div className="hero-right-cta">
              <Link href="/randevu" className="btn-fill hero-cta-primary">
                Randevu Al
              </Link>
              <Link href="/hizmetler" className="hero-discover">
                <span>Hizmetleri Keşfet</span>
                <span className="hero-discover-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hero-bottom container">
          <div className="hero-stats">
            {[
              { val: '15K+', lbl: 'Mutlu Müşteri' },
              { val: '45+',  lbl: 'Yıl Deneyim' },
              { val: '3',    lbl: 'Şube' },
            ].map((s) => (
              <div key={s.lbl} className="hero-stat">
                <span className="hero-stat-val">{s.val}</span>
                <span className="label-spaced" style={{ marginTop: '0.3rem' }}>{s.lbl}</span>
              </div>
            ))}
          </div>
          <div className="hero-scroll-cue">
            <div className="scroll-line" />
            <span className="label-spaced">Aşağı kaydır</span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap" aria-hidden>
        <div className="marquee-track">
          {MARQUEE.map((t, i) => <span key={i}>{t.trim()} •</span>)}
        </div>
      </div>

      {/* ══════════════════════════════
          INTRO — EDITORIAL TEXT BLOCK
      ══════════════════════════════ */}
      <section className="section intro-section">
        <div className="container">
          <div className="intro-grid">
            <div className="intro-index">
              <span className="section-index">01 / Hakkımızda</span>
            </div>
            <div className="intro-body">
              <p className="h-section" style={{ marginBottom: '2.5rem' }}>
                Sıradan değil,<br />
                <em className="text-orange" style={{ fontStyle: 'italic' }}>efsanevi</em> bir tıraş.
              </p>
              <p className="intro-text">
                1979'dan bu yana erkek bakımını bir sanat formu olarak ele alıyoruz. 
                Klasik berber kültürünü modern ve lüks bir atmosferle harmanlayan salonlarımızda 
                her müşteri özel muamele görür. Plus, Urban ve Junior şubelerimizle
                Zonguldak'ın en prestijli berber deneyimini sunuyoruz.
              </p>
              <div className="intro-cta">
                <Link href="/hakkimizda" className="btn" style={{ color: 'var(--text-dark)' }}>
                  Hikayemizi Oku
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICES — NUMBERED LIST
      ══════════════════════════════ */}
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

      {/* ══════════════════════════════
          ABOUT IMAGE SPLIT
      ══════════════════════════════ */}
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
            <span className="display" style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--orange)' }}>45+</span>
            <span className="label-spaced" style={{ marginTop: '0.3rem', fontSize: '0.58rem' }}>Yıllık Tecrübe</span>
          </div>
        </div>
        <div className="about-split-body">
          <span className="section-index">03 / Deneyim</span>
          <h2 className="h-section" style={{ marginBottom: '2rem' }}>
            Her Detay<br />Sizin İçin
          </h2>
          <p className="about-split-text">
            Kullanılan ürünlerden sunulan ikramlara kadar her detay özenle seçildi. 
            Kapıdan girer girmez kendinizi özel hissedeceğiniz, tıraş koltuğunda 
            kahvenizi yudumlarken tarzınızı usta ellere bırakacağınız bir deneyim.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <Link href="/hakkimizda" className="btn-fill">Daha Fazla</Link>
            <Link href="/randevu" className="btn" style={{ color: 'var(--text-dark)' }}>Randevu Al</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PRODUCTS PREVIEW — HORIZONTAL
      ══════════════════════════════ */}
      <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="svc-header" style={{ marginBottom: '3rem' }}>
            <span className="section-index">04 / Ürünler</span>
            <Link href="/urunler" className="btn" style={{ color: 'var(--text-dark)' }}>Tüm Ürünler</Link>
          </div>

          <div className="prod-prev-grid">
            {PRODUCTS_PREVIEW.map((p, i) => (
              <Link href="/urunler" key={i} className="prod-prev-card">
                <div className="prod-prev-img">
                  <Image src={p.img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  <div className="prod-prev-overlay" />
                </div>
                <div className="prod-prev-body">
                  <span className="label-orange" style={{ fontSize: '0.58rem', marginBottom: '0.5rem', display: 'block' }}>{p.badge}</span>
                  <h3 className="h-card">{p.name}</h3>
                  <p className="label-spaced" style={{ marginTop: '0.4rem', fontSize: '0.6rem' }}>{p.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          BRANCHES
      ══════════════════════════════ */}
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

      {/* ══════════════════════════════
          TEAM — if exists
      ══════════════════════════════ */}
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

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="section testi-section">
        <div className="container">
          <span className="section-index">07 / Görüşler</span>
          <div className="testi-grid">
            {[
              { q: '"Yıllardır aradığım berberi sonunda buldum. Atmosfer ve kahve harika, kesim tam istediğim gibi."', a: 'Ozan T.', loc: 'Plus' },
              { q: '"Urban şubesindeki hizmet dünya standartlarında. Adeta terapi seansı gibi hissettiriyor."', a: 'Emirhan K.', loc: 'Urban' },
              { q: '"Personelin ilgisi ve mekanın temizliği üst düzey. Junior için de mükemmel bir tercih."', a: 'Caner D.', loc: 'Junior' },
            ].map((t, i) => (
              <div key={i} className="testi-item">
                <p className="testi-quote">{t.q}</p>
                <div className="testi-meta">
                  <span className="label-spaced" style={{ fontSize: '0.6rem' }}>{t.a}</span>
                  <span className="label-orange" style={{ fontSize: '0.58rem' }}>{t.loc} Şubesi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA — FULL WIDTH DARK
      ══════════════════════════════ */}
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
          <p className="label-orange" style={{ marginBottom: '2rem' }}>Online Rezervasyon</p>
          <h2 className="h-section" style={{ color: '#fff', marginBottom: '3rem' }}>
            Randevunuzu<br />
            <em style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Hemen Alın</em>
          </h2>
          <Link href="/randevu" className="btn-fill" style={{ fontSize: '0.75rem' }}>
            Randevu Oluştur
          </Link>
        </div>
      </section>
    </>
  );
}
