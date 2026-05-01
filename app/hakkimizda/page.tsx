import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './hakkimizda.css';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Endamsince Erkek Kuaför hakkında bilgi edinin. Misyonumuz, vizyonumuz ve hikayemiz.',
};

const VALUES = [
  { icon: '🎯', title: 'Mükemmellik', desc: 'Her kesimde mükemmelliği hedefliyoruz. Detay odaklı yaklaşımımız bizi farklı kılıyor.' },
  { icon: '❤️', title: 'Tutku',       desc: 'Berberlik sadece bir meslek değil, bizim için bir sanat formu ve yaşam biçimi.' },
  { icon: '🤝', title: 'Güven',       desc: 'Müşterilerimizle uzun vadeli ilişkiler kuruyoruz. Her ziyaret daha samimi bir deneyim.' },
  { icon: '✨', title: 'Yenilik',     desc: 'Klasik kültürü modern tekniklerle harmanlıyoruz. Her daim güncel ve ilerici.' },
];

const TEAM_STATS = [
  { val: '2014', label: 'Kuruluş Yılı' },
  { val: '15K+', label: 'Mutlu Müşteri' },
  { val: '3',    label: 'Premium Şube' },
  { val: '12',   label: 'Uzman Stilist' },
];

export default function HakkimizdaPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">Bizi Tanıyın</span>
          <h1>Endamsince'nin <span className="text-orange">Hikayesi</span></h1>
          <p>1979'dan bu yana Zonguldak'ta köklü erkek bakım zinciri olarak faaliyet gösteriyoruz.</p>
        </div>
      </div>

      {/* ─── STORY ─── */}
      <section className="section">
        <div className="container">
          <div className="story-grid">
            <div className="story-images">
              <div className="story-img-main">
                <Image
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80"
                  alt="Endamsince Salon"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="story-img-sub">
                <Image
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80"
                  alt="Endamsince Detail"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="story-badge">
                <span className="display" style={{ fontSize: '2rem' }}>10+</span>
                <small>Yıllık Tecrübe</small>
              </div>
            </div>

            <div className="story-body">
              <p className="eyebrow">Hikayemiz</p>
              <h2 className="h2" style={{ marginBottom: '1.5rem' }}>
                Tutkunun <span className="text-orange">Doğurduğu</span> Marka
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-mid)', marginBottom: '1.2rem' }}>
                Endamsince, erkek bakımına duyulan derin tutku ve klasik berber geleneğini yaşatma istesiyle 1979 yılında Zonguldak'ta kuruldu. Kurucularımız, berberlığin en ince ayrıntılarına verilen özenle Zonguldak'a farklı bir soluk getirdi.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-mid)', marginBottom: '1.2rem' }}>
                İlk günden itibaren "sıradan tıraş" anlayışını reddettik. Her müşteri, kapıdan girer girmez kendini özel hissetmeli; çıktığında ise en iyi halini taşımalı — bu bizim temel ilkemiz.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-mid)', marginBottom: '2.5rem' }}>
                Bugün 3 şube, 12 uzman stilist ve 15.000'den fazla memnun müşteri ile Zonguldak'ın lider erkek bakım markası konumundayız.
              </p>

              {/* Stats */}
              <div className="story-stats">
                {TEAM_STATS.map((s) => (
                  <div key={s.label} className="story-stat">
                    <span className="story-stat-val">{s.val}</span>
                    <span className="story-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION & VISION ─── */}
      <section className="section mv-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Değerlerimiz</p>
            <h2 className="h2">Misyon & <span className="text-orange">Vizyon</span></h2>
          </div>

          <div className="mv-grid">
            {/* Mission */}
            <div className="mv-card mission-card">
              <div className="mv-icon">🎯</div>
              <h3>Misyonumuz</h3>
              <p>
                Erkek bakımında global standartları yerelde hayata geçirmek. 
                Her müşterimize kişiselleştirilmiş, üst düzey hizmet sunmak ve 
                tarzını en ince detayına kadar mükemmelleştirmasına yardımcı olmak.
              </p>
              <ul className="mv-list">
                <li>Kişiye özel kesim ve bakım danışmanlığı</li>
                <li>Dünya markası premium ürünler kullanımı</li>
                <li>Sürekli eğitim ile uzman kadro</li>
                <li>Hijyen ve konfor standartlarını üst düzeyde tutmak</li>
              </ul>
            </div>

            {/* Vision */}
            <div className="mv-card vision-card">
              <div className="mv-icon">🚀</div>
              <h3>Vizyonumuz</h3>
              <p>
                2030 yılına kadar Türkiye'nin en büyük premium erkek bakım zinciri olmak. 
                Endamsince adını, erkek grooming dünyasında güven ve kaliteyi temsil eden 
                global bir marka haline getirmek.
              </p>
              <ul className="mv-list">
                <li>10 şehirde 20+ premium şube hedefi</li>
                <li>Endamsince Academy eğitim merkezi</li>
                <li>Özel Endamsince ürün koleksiyonu</li>
                <li>Dijital randevu ve kişisel bakım takip sistemi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Temel İlkeler</p>
            <h2 className="h2">Bizi <span className="text-orange">Biz Yapan</span> Değerler</h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card card">
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Yolculuğumuz</p>
            <h2 className="h2">Kilometre <span className="text-orange">Taşları</span></h2>
          </div>
          <div className="timeline">
            {[
              { year: '1979', title: 'Kuruluş', desc: 'Zonguldak\'ta ilk Endamsince şubesi açıldı. 3 stilist, 1 ekip.' },
              { year: '1992', title: 'Büyüme',  desc: 'Endam Urban şubesi açıldı. Ekibimiz 6 kişiye ulaştı.' },
              { year: '2005', title: 'Ödül',    desc: 'Zonguldak\'un En İyi Erkek Kuaförü ödülünü aldık.' },
              { year: '2018', title: 'Premium', desc: 'Endam Junior VIP şubesi açıldı. Lüks segment odağı.' },
              { year: '2024', title: 'Zirve',   desc: '10. yılımızda 15.000 müşteri eşiğini geçtik.' },
            ].map((t, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot" />
                <div className="timeline-card card">
                  <span className="timeline-year display">{t.year}</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.5rem 0 0.3rem' }}>{t.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.75 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-simple">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ marginBottom: '1rem' }}>
            Hikayemizin Bir Parçası Olun
          </h2>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Tarzınızı usta ellere teslim edin. Kolayca online randevu alın.
          </p>
          <Link href="/randevu" className="btn btn-primary btn-lg">Randevu Al →</Link>
        </div>
      </section>
    </>
  );
}
