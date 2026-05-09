// Build sırasında DB hazırlığı.
// DATABASE_URL set ise: schema push + seed çalışır.
// Set değilse: sessizce atlar (build kırılmasın).
import { execSync } from 'node:child_process';

const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!url) {
  console.log('[db-prepare] DATABASE_URL yok, schema push & seed atlandı.');
  process.exit(0);
}

// DATABASE_URL alternatif adlardan geldiyse, prisma için export et
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

try {
  console.log('[db-prepare] timeslots → personnel migration…');
  execSync('node scripts/migrate-timeslots-personnel.mjs', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (err) {
  console.error('[db-prepare] timeslots migration hatası — devam ediyor.', err?.message || err);
}

try {
  console.log('[db-prepare] prisma db push…');
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (err) {
  console.error('[db-prepare] db push hatası — devam ediyor.', err?.message || err);
  // Build'i kırma
  process.exit(0);
}

try {
  console.log('[db-prepare] seed…');
  execSync('npm run seed', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.error('[db-prepare] seed hatası — devam ediyor.', err?.message || err);
  process.exit(0);
}

console.log('[db-prepare] tamamlandı.');
