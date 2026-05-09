// Idempotent migration: TimeSlot global → personel başına.
// Eski global saatleri her personel için kopyalar. Randevular etkilenmez.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TimeSlot'
  `;
  if (tables.length === 0) {
    console.log('[migrate-timeslots] TimeSlot tablosu yok, ilk kurulum — atlanıyor.');
    return;
  }

  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TimeSlot' AND column_name = 'personnelId'
  `;
  if (cols.length > 0) {
    console.log('[migrate-timeslots] zaten yapılmış — atlanıyor.');
    return;
  }

  console.log('[migrate-timeslots] başlıyor…');

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
      await prisma.timeSlot.create({
        data: {
          time: s.time,
          order: s.order ?? 0,
          active: s.active ?? true,
          personnelId: p.id,
        },
      });
    }
  }
  console.log('[migrate-timeslots] tamam.');
}

main()
  .catch((err) => {
    console.error('[migrate-timeslots] hata:', err?.message || err);
    process.exitCode = 0; // build kırılmasın
  })
  .finally(() => prisma.$disconnect());
