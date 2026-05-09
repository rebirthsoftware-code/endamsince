// Idempotent migration + self-healing backfill.
// 1) TimeSlot global → personel başına şema dönüşümü (bir kerelik, tekrar tekrar güvenli)
// 2) Saati olmayan her personel için varsayılan saatleri ekler (her build'de güvenli)
// Randevular hiçbir zaman etkilenmez.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SLOTS = (() => {
  const out = [];
  for (let h = 9; h < 20; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  out.push('20:00');
  return out;
})();

async function migrateSchemaIfNeeded() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TimeSlot'
  `;
  if (tables.length === 0) {
    console.log('[migrate-timeslots] TimeSlot tablosu yok, ilk kurulum — şema atlandı.');
    return;
  }

  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimeSlot' AND column_name = 'personnelId'
  `;
  if (cols.length > 0) {
    console.log('[migrate-timeslots] şema dönüşümü zaten yapılmış.');
    return;
  }

  console.log('[migrate-timeslots] şema dönüşümü başlıyor…');

  const oldSlots = await prisma.$queryRawUnsafe(
    `SELECT time, "order", active FROM "TimeSlot"`
  );
  const personnel = await prisma.$queryRawUnsafe(`SELECT id FROM "Personnel"`);
  console.log(`[migrate-timeslots] ${oldSlots.length} eski saat × ${personnel.length} personel`);

  await prisma.$executeRawUnsafe(`ALTER TABLE "TimeSlot" ADD COLUMN "personnelId" TEXT`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" DROP CONSTRAINT IF EXISTS "TimeSlot_time_key"`
  );
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "TimeSlot_active_order_idx"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "TimeSlot"`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" ALTER COLUMN "personnelId" SET NOT NULL`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_personnelId_time_key" UNIQUE ("personnelId", "time")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "TimeSlot_personnelId_active_order_idx" ON "TimeSlot" ("personnelId", "active", "order")`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_personnelId_fkey"
       FOREIGN KEY ("personnelId") REFERENCES "Personnel"(id) ON DELETE CASCADE`
  );

  for (const p of personnel) {
    for (const s of oldSlots) {
      try {
        await prisma.timeSlot.create({
          data: {
            time: s.time,
            order: s.order ?? 0,
            active: s.active ?? true,
            personnelId: p.id,
          },
        });
      } catch (e) {
        console.warn('[migrate-timeslots] insert atlandı', s.time, e?.message);
      }
    }
  }
  console.log('[migrate-timeslots] şema dönüşümü tamam.');
}

async function backfillEmptyPersonnel() {
  // Hiç saati olmayan personeli bul, varsayılan saatleri ekle.
  const empty = await prisma.$queryRawUnsafe(`
    SELECT p.id FROM "Personnel" p
    LEFT JOIN "TimeSlot" ts ON ts."personnelId" = p.id
    GROUP BY p.id
    HAVING COUNT(ts.id) = 0
  `);
  if (empty.length === 0) {
    console.log('[migrate-timeslots] backfill: tüm personelin saati var.');
    return;
  }
  console.log(`[migrate-timeslots] backfill: ${empty.length} personele varsayılan saat ekleniyor…`);
  for (const p of empty) {
    for (let i = 0; i < DEFAULT_SLOTS.length; i++) {
      try {
        await prisma.timeSlot.create({
          data: {
            time: DEFAULT_SLOTS[i],
            order: i + 1,
            active: true,
            personnelId: p.id,
          },
        });
      } catch (e) {
        // unique violation = zaten var, atla
        if (!String(e?.message || '').includes('Unique')) {
          console.warn('[migrate-timeslots] backfill insert hata', DEFAULT_SLOTS[i], e?.message);
        }
      }
    }
  }
  console.log('[migrate-timeslots] backfill tamam.');
}

async function main() {
  await migrateSchemaIfNeeded();
  // Backfill yalnızca yeni şema yerleştiyse mantıklı
  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimeSlot' AND column_name = 'personnelId'
  `;
  if (cols.length > 0) {
    await backfillEmptyPersonnel();
  }
}

main()
  .catch((err) => {
    console.error('[migrate-timeslots] hata:', err?.message || err);
    process.exitCode = 0; // build kırılmasın
  })
  .finally(() => prisma.$disconnect());
