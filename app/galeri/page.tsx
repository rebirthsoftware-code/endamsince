import type { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSiteContent, pick } from '@/lib/content';
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

export default async function GaleriPage() {
  const dict = await getSiteContent();

  let items: Item[] = [];
  let branchCount = 0;
  try {
    [items, branchCount] = await Promise.all([
      prisma.galleryItem.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, url: true, title: true, category: true, width: true, height: true },
      }),
      prisma.branch.count(),
    ]);
  } catch (err) {
    console.error('Galeri yüklenemedi:', err);
  }

  return (
    <>
      <section className="gallery-hero">
        <div className="gallery-hero-bg" aria-hidden />
        <div className="container gallery-hero-inner">
          <span className="gallery-hero-label">{pick(dict, 'galeri.hero.label', 'Endamsince · Atölye')}</span>
          <h1 className="gallery-hero-title">
            {pick(dict, 'galeri.hero.title.1', 'Bir')} <em>{pick(dict, 'galeri.hero.title.2', 'sanat')}</em><br />
            {pick(dict, 'galeri.hero.title.3', 'formu olarak')}<br />
            <em>{pick(dict, 'galeri.hero.title.4', 'tıraş.')}</em>
          </h1>
          <p className="gallery-hero-sub">
            {pick(dict, 'galeri.hero.body', '45 yıllık ustalığın izleri, kapımızdan girer girmez kendinizi farklı hissettiren atmosfer ve her bir müşteriyle yazılan tarz hikayeleri.')}
          </p>
          <div className="gallery-hero-meta">
            <span><strong>{items.length}</strong> {pick(dict, 'galeri.hero.meta.items', 'Eser')}</span>
            <span><strong>{branchCount || 3}</strong> {pick(dict, 'galeri.hero.meta.branches', 'Şube')}</span>
            <span><strong>{pick(dict, 'galeri.hero.meta.year.value', '1979')}</strong> {pick(dict, 'galeri.hero.meta.year.label', 'Kuruluş')}</span>
          </div>
        </div>
        <div className="gallery-hero-scroll" aria-hidden>
          <span />
        </div>
      </section>

      <GalleryClient items={items} />
    </>
  );
}
