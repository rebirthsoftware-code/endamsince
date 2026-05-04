import type { Metadata } from 'next';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { getSiteContent, pick } from '@/lib/content';
import './urunler.css';

export const metadata: Metadata = {
  title: 'Ürünler',
  description: 'Endamsince\'nin önerdiği premium erkek bakım ürünleri.',
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function UrunlerPage() {
  const dict = await getSiteContent('urunler');

  let products: any[] = [];
  let featured: any | null = null;
  let quality: any[] = [];

  try {
    [products, featured, quality] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.product.findFirst({
        where: { active: true, featured: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.infoCard.findMany({
        where: { active: true, group: 'product-quality' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
  } catch (err) {
    console.error('Ürünler içerik yüklenemedi:', err);
  }

  return (
    <>
      {/* HERO */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">{pick(dict, 'urunler.hero.eyebrow', 'Premium Koleksiyon')}</span>
          <h1>
            {pick(dict, 'urunler.hero.title.1', 'Bakım')}{' '}
            <span className="text-orange">{pick(dict, 'urunler.hero.title.2', 'Ürünleri')}</span>
          </h1>
          <p>{pick(dict, 'urunler.hero.body', 'Salonlarımızda kullandığımız ve önerdiğimiz dünya markası ürünler.')}</p>
        </div>
      </div>

      {/* FEATURED */}
      {featured && (
        <section className="section">
          <div className="container">
            <div className="featured-product">
              <div className="featured-img">
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt={featured.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div className="featured-badge">{pick(dict, 'urunler.featured.badge', 'Ayın Ürünü')}</div>
              </div>
              <div className="featured-body">
                <p className="eyebrow">{pick(dict, 'urunler.featured.eyebrow', 'Öne Çıkan')}</p>
                <h2 className="h2" style={{ marginBottom: '0.8rem' }}>{featured.name}</h2>
                <p className="text-mid" style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                  {featured.description}
                </p>
                <div className="featured-price">
                  <span>{featured.price}</span>
                  <button className="btn btn-primary">İncele</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTS GRID */}
      {products.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)', paddingTop: '3rem' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'urunler.grid.eyebrow', 'Tüm Ürünler')}</p>
              <h2 className="h2">
                {pick(dict, 'urunler.grid.title.1', 'Koleksiyonu')}{' '}
                <span className="text-orange">{pick(dict, 'urunler.grid.title.2', 'Keşfet')}</span>
              </h2>
            </div>

            <div className="products-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card card">
                  <div className="product-img">
                    {p.image && <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />}
                    <div className="product-overlay" />
                    {p.tag && <span className="product-tag-badge">{p.tag}</span>}
                    {p.category && <span className="product-cat-badge">{p.category}</span>}
                  </div>
                  <div className="product-body">
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-sub text-muted">{p.subtitle}</p>
                    <p className="product-desc text-muted">{p.description}</p>
                    <div className="product-footer">
                      <span className="product-price text-orange">{p.price}</span>
                      <button className="btn btn-outline btn-sm">İncele</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* QUALITY */}
      {quality.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'urunler.quality.eyebrow', 'Neden Endamsince?')}</p>
              <h2 className="h2">
                {pick(dict, 'urunler.quality.title.1', 'Ürün')}{' '}
                <span className="text-orange">{pick(dict, 'urunler.quality.title.2', 'Kalitesi')}</span>
              </h2>
            </div>
            <div className="quality-grid">
              {quality.map((q) => (
                <div key={q.id} className="quality-card card">
                  <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{q.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '0.6rem' }}>{q.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.8 }}>{q.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
