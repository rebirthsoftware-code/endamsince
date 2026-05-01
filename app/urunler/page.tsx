import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './urunler.css';

export const metadata: Metadata = {
  title: 'Ürünler',
  description: 'Endamsince\'nin önerdiği premium erkek bakım ürünleri. Saç wax, sakal yağı, şampuan ve daha fazlası.',
};

const CATEGORIES = ['Tümü', 'Saç', 'Sakal', 'Cilt', 'Styling'];

const PRODUCTS = [
  {
    id: 1, cat: 'Styling',
    name: 'Black Gold Wax',
    subtitle: 'Güçlü Tutuş · Mat Bitim',
    price: '₺320',
    tag: '⭐ Çok Satan',
    img: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&q=80',
    desc: 'Güçlü tutuş, doğal mat görünüm. Saçınıza ağır koku bırakmadan şekil verin.',
  },
  {
    id: 2, cat: 'Sakal',
    name: 'Premium Sakal Yağı',
    subtitle: 'Argan + Jojoba Karışımı',
    price: '₺285',
    tag: '🆕 Yeni',
    img: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=500&q=80',
    desc: 'Sakalı besler, yumuşatır ve doğal parlaklık katar. Kaşıntıyı giderir.',
  },
  {
    id: 3, cat: 'Saç',
    name: 'Altın Serum',
    subtitle: 'Keratin Güçlendirici',
    price: '₺410',
    tag: '💎 Premium',
    img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80',
    desc: 'Saç tellerini derinlemesine besler, kırılmayı önler ve ışıl parlaklık verir.',
  },
  {
    id: 4, cat: 'Cilt',
    name: 'Hydra Yüz Kremi',
    subtitle: 'Derin Nemlendirici',
    price: '₺195',
    tag: '❤️ Favori',
    img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80',
    desc: 'Erkek cildine özel formülü ile 24 saat nemlendirme sağlar.',
  },
  {
    id: 5, cat: 'Saç',
    name: 'Prestige Şampuan',
    subtitle: 'Hacim Verici',
    price: '₺165',
    tag: '🌿 Doğal',
    img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
    desc: 'Saç dibini derinlemesine temizler, hacim ve canlılık kazandırır.',
  },
  {
    id: 6, cat: 'Styling',
    name: 'Clay Pomade',
    subtitle: 'Orta Tutuş · Parlak',
    price: '₺295',
    tag: '🔥 Trend',
    img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80',
    desc: 'Esnek tutuş ve yüksek parlaklık. Günün her saati mükemmel görünüm.',
  },
];

export default function UrunlerPage() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">Premium Koleksiyon</span>
          <h1>Bakım <span className="text-orange">Ürünleri</span></h1>
          <p>Salonlarımızda kullandığımız ve önerdiğimiz dünya markası ürünler.</p>
        </div>
      </div>

      {/* ─── FEATURED ─── */}
      <section className="section">
        <div className="container">
          <div className="featured-product">
            <div className="featured-img">
              <Image
                src="https://images.unsplash.com/photo-1617897903246-719242758050?w=700&q=80"
                alt="Black Gold Wax"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="featured-badge">Ayın Ürünü</div>
            </div>
            <div className="featured-body">
              <p className="eyebrow">Öne Çıkan</p>
              <h2 className="h2" style={{ marginBottom: '0.8rem' }}>
                Black Gold <span className="text-orange">Wax</span>
              </h2>
              <p className="text-mid" style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                Endamsince'nin en çok tercih edilen saç şekillendirme ürünü. 
                Güçlü tutuş kapasitesi ve mat bitimi ile uzun süre mükemmel görünüm sağlar. 
                Doğal içerikli formülü saç sağlığını korurken şekillendirme gücünü artırır.
              </p>
              <div className="featured-specs">
                {['%100 Doğal İçerik', 'Dermatolog Onaylı', 'Türkiye Üretim', 'Vegan Formül'].map((s) => (
                  <span key={s} className="spec-tag">{s}</span>
                ))}
              </div>
              <div className="featured-price">
                <span>₺320</span>
                <button className="btn btn-primary">Satın Al</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID ─── */}
      <section className="section" style={{ background: 'var(--surface)', paddingTop: '3rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Tüm Ürünler</p>
            <h2 className="h2">Koleksiyonu <span className="text-orange">Keşfet</span></h2>
          </div>

          {/* Grid */}
          <div className="products-grid">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="product-card card">
                <div className="product-img">
                  <Image src={p.img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  <div className="product-overlay" />
                  <span className="product-tag-badge">{p.tag}</span>
                  <span className="product-cat-badge">{p.cat}</span>
                </div>
                <div className="product-body">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-sub text-muted">{p.subtitle}</p>
                  <p className="product-desc text-muted">{p.desc}</p>
                  <div className="product-footer">
                    <span className="product-price text-orange">{p.price}</span>
                    <button className="btn btn-outline btn-sm">Satın Al</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY OUR PRODUCTS ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Neden Endamsince?</p>
            <h2 className="h2">Ürün <span className="text-orange">Kalitesi</span></h2>
          </div>
          <div className="quality-grid">
            {[
              { icon: '🌿', title: 'Doğal İçerikler', desc: 'Tüm ürünlerimizde doğal ve sürdürülebilir hammaddeler kullanılır.' },
              { icon: '🔬', title: 'Laboratuvar Testi', desc: 'Her ürün, deri testi ve klinik çalışmalardan geçirilmiştir.' },
              { icon: '🏆', title: 'Uzman Onayı',      desc: '12 uzman stilistimiz tarafından test edilip önerilmektedir.' },
              { icon: '♻️', title: 'Sürdürülebilir',   desc: 'Çevre dostu ambalaj ve üretim süreçleri.' },
            ].map((q, i) => (
              <div key={i} className="quality-card card">
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{q.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '0.6rem' }}>{q.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.8 }}>{q.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
