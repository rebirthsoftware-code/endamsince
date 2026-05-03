import type { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import GalleryClient from './GalleryClient';
import './Galeri.css';

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'Endamsince Erkek Kuaför\'ün şubelerinden, ekibinden ve çalışmalarından kareler.',
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

type Item = {
  id: string;
  url: string;
  title: string | null;
  category: string | null;
  width: number | null;
  height: number | null;
};

async function getItems(): Promise<Item[]> {
  try {
    return await prisma.galleryItem.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, url: true, title: true, category: true, width: true, height: true },
    });
  } catch (err) {
    console.error('Galeri yüklenemedi:', err);
    return [];
  }
}

export default async function GaleriPage() {
  const items = await getItems();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="gallery-hero">
        <div className="gallery-hero-bg" aria-hidden />
        <div className="container gallery-hero-inner">
          <span className="gallery-hero-label">Endamsince · Atölye</span>
          <h1 className="gallery-hero-title">
            Bir <em>sanat</em><br />formu olarak<br /><em>tıraş.</em>
          </h1>
          <p className="gallery-hero-sub">
            45 yıllık ustalığın izleri, kapımızdan girer girmez kendinizi farklı hissettiren atmosfer
            ve her bir müşteriyle yazılan tarz hikayeleri.
          </p>
          <div className="gallery-hero-meta">
            <span><strong>{items.length}</strong> Eser</span>
            <span><strong>3</strong> Şube</span>
            <span><strong>1979</strong> Kuruluş</span>
          </div>
        </div>
        <div className="gallery-hero-scroll" aria-hidden>
          <span />
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <GalleryClient items={items} />
    </>
  );
}
