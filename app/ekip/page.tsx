import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getSiteContent, pick } from '@/lib/content';
import './ekip.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ekibimiz',
  description: 'Endamsince\'nin uzman berber ve stilistleri.',
};

const prisma = new PrismaClient();

export default async function EkipPage() {
  const dict = await getSiteContent();
  const careerEmail = pick(dict, 'contact.career.email', 'kariyer@endamsince.com');
  const phoneTel = pick(dict, 'contact.phone.tel', '+905551234567');

  let personnel: any[] = [];
  let perks: any[] = [];

  try {
    [personnel, perks] = await Promise.all([
      prisma.personnel.findMany({ include: { branch: true } }),
      prisma.infoCard.findMany({
        where: { active: true, group: 'team-perks' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
  } catch (error) {
    console.error('Ekip içerik yüklenemedi:', error);
  }

  return (
    <>
      {/* HERO */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">{pick(dict, 'ekip.hero.eyebrow', 'Profesyonel Ekip')}</span>
          <h1>
            {pick(dict, 'ekip.hero.title.1', 'Uzman')}{' '}
            <span className="text-orange">{pick(dict, 'ekip.hero.title.2', 'Stilistlerimiz')}</span>
          </h1>
          <p>{pick(dict, 'ekip.hero.body', 'Tarzınızı uluslararası standartlarda eğitim almış uzmanlara teslim edin.')}</p>
        </div>
      </div>

      {/* TEAM GRID */}
      <section className="section">
        <div className="container">
          {personnel.length > 0 ? (
            <div className="team-grid">
              {personnel.map((p) => (
                <div key={p.id} className="team-card">
                  <div className="team-img">
                    {p.image
                      ? <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      : (
                        <div className="team-avatar-placeholder">
                          <span>{p.name.charAt(0)}</span>
                        </div>
                      )
                    }
                    <div className="team-img-overlay" />
                    <div className="team-branch-tag">{p.branch.name}</div>
                  </div>
                  <div className="team-body">
                    <h3>{p.name}</h3>
                    <p className="team-role text-orange">{p.role}</p>
                    <p className="team-desc text-muted">Uzman stilist · {p.branch.name}</p>
                    <Link href={`/randevu?personnelId=${p.id}`} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                      Randevu Al
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-team">
              <div className="empty-icon">👥</div>
              <h3>Ekip bilgileri yükleniyor...</h3>
              <p className="text-muted">Personel panelinden ekip üyelerini ekleyebilirsiniz.</p>
            </div>
          )}
        </div>
      </section>

      {/* JOIN US */}
      {perks.length > 0 && (
        <section className="section" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="join-grid">
              <div>
                <p className="eyebrow">{pick(dict, 'ekip.career.eyebrow', 'Kariyer')}</p>
                <h2 className="h2">
                  {pick(dict, 'ekip.career.title.1', 'Ekibimize')}{' '}
                  <span className="text-orange">{pick(dict, 'ekip.career.title.2', 'Katılın')}</span>
                </h2>
                <p className="text-muted" style={{ marginTop: '1rem', lineHeight: 1.85, maxWidth: 480 }}>
                  {pick(dict, 'ekip.career.body', 'Tutkulu ve yetenekli berber / stilistler arıyoruz.')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                  <a href={`mailto:${careerEmail}`} className="btn btn-primary">Başvuru Yap</a>
                  <a href={`tel:${phoneTel}`} className="btn btn-outline">Bizi Ara</a>
                </div>
              </div>
              <div className="join-perks">
                {perks.map((p) => (
                  <div key={p.id} className="perk-item">
                    <span className="perk-icon">{p.icon}</span>
                    <div>
                      <strong>{p.title}</strong>
                      <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
