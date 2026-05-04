import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getSiteContent, pick } from '@/lib/content';
import './hakkimizda.css';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Endamsince Erkek Kuaför hakkında bilgi edinin.',
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function HakkimizdaPage() {
  const dict = await getSiteContent('about');

  let stats: any[] = [];
  let values: any[] = [];
  let mv: any[] = [];
  let timeline: any[] = [];

  try {
    [stats, values, mv, timeline] = await Promise.all([
      prisma.stat.findMany({
        where: { active: true, group: 'about-story' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.infoCard.findMany({
        where: { active: true, group: 'about-values' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.infoCard.findMany({
        where: { active: true, group: 'about-mv' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.infoCard.findMany({
        where: { active: true, group: 'about-timeline' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
  } catch (err) {
    console.error('Hakkımızda içerik yüklenemedi:', err);
  }

  return (
    <>
      {/* HERO */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">{pick(dict, 'about.hero.eyebrow', 'Bizi Tanıyın')}</span>
          <h1>
            {pick(dict, 'about.hero.title.1', "Endamsince'nin")}{' '}
            <span className="text-orange">{pick(dict, 'about.hero.title.2', 'Hikayesi')}</span>
          </h1>
          <p>{pick(dict, 'about.hero.body', "1979'dan bu yana Zonguldak'ta köklü erkek bakım zinciri olarak faaliyet gösteriyoruz.")}</p>
        </div>
      </div>

      {/* STORY */}
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
                <span className="display" style={{ fontSize: '2rem' }}>{pick(dict, 'about.story.badge.val', '10+')}</span>
                <small>{pick(dict, 'about.story.badge.lbl', 'Yıllık Tecrübe')}</small>
              </div>
            </div>

            <div className="story-body">
              <p className="eyebrow">{pick(dict, 'about.story.eyebrow', 'Hikayemiz')}</p>
              <h2 className="h2" style={{ marginBottom: '1.5rem' }}>
                {pick(dict, 'about.story.title.1', 'Tutkunun')}{' '}
                <span className="text-orange">{pick(dict, 'about.story.title.2', 'Doğurduğu')}</span>{' '}
                {pick(dict, 'about.story.title.3', 'Marka')}
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-mid)', marginBottom: '1.2rem' }}>
                {pick(dict, 'about.story.p1', '')}
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-mid)', marginBottom: '1.2rem' }}>
                {pick(dict, 'about.story.p2', '')}
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-mid)', marginBottom: '2.5rem' }}>
                {pick(dict, 'about.story.p3', '')}
              </p>

              <div className="story-stats">
                {stats.map((s) => (
                  <div key={s.id} className="story-stat">
                    <span className="story-stat-val">{s.value}</span>
                    <span className="story-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      {mv.length > 0 && (
        <section className="section mv-section" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'about.mv.eyebrow', 'Değerlerimiz')}</p>
              <h2 className="h2">
                {pick(dict, 'about.mv.title.1', 'Misyon &')}{' '}
                <span className="text-orange">{pick(dict, 'about.mv.title.2', 'Vizyon')}</span>
              </h2>
            </div>

            <div className="mv-grid">
              {mv.map((m) => (
                <div key={m.id} className={`mv-card ${m.subtitle === 'mission' ? 'mission-card' : 'vision-card'}`}>
                  <div className="mv-icon">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  {m.bullets.length > 0 && (
                    <ul className="mv-list">
                      {m.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VALUES */}
      {values.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'about.values.eyebrow', 'Temel İlkeler')}</p>
              <h2 className="h2">
                {pick(dict, 'about.values.title.1', 'Bizi')}{' '}
                <span className="text-orange">{pick(dict, 'about.values.title.2', 'Biz Yapan')}</span>{' '}
                {pick(dict, 'about.values.title.3', 'Değerler')}
              </h2>
            </div>
            <div className="values-grid">
              {values.map((v) => (
                <div key={v.id} className="value-card card">
                  <div className="value-icon">{v.icon}</div>
                  <h3 className="value-title">{v.title}</h3>
                  <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TIMELINE */}
      {timeline.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{pick(dict, 'about.timeline.eyebrow', 'Yolculuğumuz')}</p>
              <h2 className="h2">
                {pick(dict, 'about.timeline.title.1', 'Kilometre')}{' '}
                <span className="text-orange">{pick(dict, 'about.timeline.title.2', 'Taşları')}</span>
              </h2>
            </div>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={t.id} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-card card">
                    <span className="timeline-year display">{t.icon}</span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.5rem 0 0.3rem' }}>{t.title}</h3>
                    <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.75 }}>{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-simple">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ marginBottom: '1rem' }}>
            {pick(dict, 'about.cta.title', 'Hikayemizin Bir Parçası Olun')}
          </h2>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            {pick(dict, 'about.cta.body', 'Tarzınızı usta ellere teslim edin. Kolayca online randevu alın.')}
          </p>
          <Link href="/randevu" className="btn btn-primary btn-lg">
            {pick(dict, 'about.cta.button', 'Randevu Al →')}
          </Link>
        </div>
      </section>
    </>
  );
}
