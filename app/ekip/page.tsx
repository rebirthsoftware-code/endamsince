import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import './ekip.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ekibimiz',
  description: 'Endamsince\'nin uzman berber ve stilistleri. Ekibimizi tanıyın.',
};

const prisma = new PrismaClient();

export default async function EkipPage() {
  const personnel = await prisma.personnel.findMany({ include: { branch: true } });

  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-label display">Profesyonel Ekip</span>
          <h1>Uzman <span className="text-orange">Stilistlerimiz</span></h1>
          <p>Tarzınızı uluslararası standartlarda eğitim almış uzmanlara teslim edin.</p>
        </div>
      </div>

      {/* ─── TEAM GRID ─── */}
      <section className="section">
        <div className="container">
          {personnel.length > 0 ? (
            <div className="team-grid">
              {personnel.map((p, i) => (
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

      {/* ─── JOIN US ─── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="join-grid">
            <div>
              <p className="eyebrow">Kariyer</p>
              <h2 className="h2">Ekibimize <span className="text-orange">Katılın</span></h2>
              <p className="text-muted" style={{ marginTop: '1rem', lineHeight: 1.85, maxWidth: 480 }}>
                Tutkulu ve yetenekli berber / stilistler arıyoruz. Endamsince ailesinin bir parçası olmak ve 
                kariyerinizi zirveye taşımak için bizimle iletişime geçin.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <a href="mailto:kariyer@endamsince.com" className="btn btn-primary">Başvuru Yap</a>
                <a href="tel:+905551234567" className="btn btn-outline">Bizi Ara</a>
              </div>
            </div>
            <div className="join-perks">
              {[
                { icon: '📚', title: 'Sürekli Eğitim',    desc: 'Yurt içi ve yurt dışı eğitim fırsatları.' },
                { icon: '💰', title: 'Rekabetçi Ücret',   desc: 'Sektör ortalamasının üzerinde maaş + prim.' },
                { icon: '🌟', title: 'Kariyer Gelişimi',  desc: 'Şef stilist ve yönetim pozisyonlarına yükselme.' },
                { icon: '🤝', title: 'Takım Ruhu',        desc: 'Destekleyici ve motive edici çalışma ortamı.' },
              ].map((p, i) => (
                <div key={i} className="perk-item">
                  <span className="perk-icon">{p.icon}</span>
                  <div>
                    <strong>{p.title}</strong>
                    <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
