// Idempotent migration + self-healing backfill.
// 1) TimeSlot: global → personel başına şema dönüşümü
// 2) TimeSlot: personnel-level → (personel, dayOfWeek) bazına dönüşüm (Pzt-Cmt)
// 3) Saati boş (personel, gün) için varsayılan saatleri ekler
// Randevular hiçbir zaman etkilenmez. Pazar (0) kapalı.
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

const DAYS = [1, 2, 3, 4, 5, 6]; // Pzt..Cmt

async function colExists(col) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'TimeSlot' AND column_name = $1`,
    col
  );
  return rows.length > 0;
}

async function tableExists() {
  const rows = await prisma.$queryRaw`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TimeSlot'
  `;
  return rows.length > 0;
}

// Adım 1: global → personel başına (eski)
async function migratePersonnelSchemaIfNeeded() {
  if (await colExists('personnelId')) {
    console.log('[migrate-timeslots] personnelId zaten var.');
    return;
  }
  console.log('[migrate-timeslots] personnelId eklemesi başlıyor…');

  const oldSlots = await prisma.$queryRawUnsafe(
    `SELECT time, "order", active FROM "TimeSlot"`
  );
  const personnel = await prisma.$queryRawUnsafe(`SELECT id FROM "Personnel"`);
  console.log(
    `[migrate-timeslots] ${oldSlots.length} eski saat × ${personnel.length} personel`
  );

  await prisma.$executeRawUnsafe(`ALTER TABLE "TimeSlot" ADD COLUMN "personnelId" TEXT`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" DROP CONSTRAINT IF EXISTS "TimeSlot_time_key"`
  );
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "TimeSlot_active_order_idx"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "TimeSlot"`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" ALTER COLUMN "personnelId" SET NOT NULL`
  );
  // Geçici eski unique (sonraki adımda kaldırılacak)
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

  // Eski global saatleri her personele Pzt için yaz; sonraki adım 6 güne yayacak
  for (const p of personnel) {
    for (let i = 0; i < oldSlots.length; i++) {
      const s = oldSlots[i];
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "TimeSlot" (id, time, "order", active, "personnelId", "createdAt")
             VALUES ($1, $2, $3, $4, $5, NOW())`,
          'tsmig_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
          s.time,
          s.order ?? i + 1,
          s.active ?? true,
          p.id
        );
      } catch (e) {
        console.warn('[migrate-timeslots] insert atlandı', s.time, e?.message);
      }
    }
  }
  console.log('[migrate-timeslots] personnelId tamam.');
}

// Adım 2: personel başına → (personel, dayOfWeek) bazına
async function migrateDayOfWeekIfNeeded() {
  if (await colExists('dayOfWeek')) {
    console.log('[migrate-timeslots] dayOfWeek zaten var.');
    return;
  }
  console.log('[migrate-timeslots] dayOfWeek eklemesi başlıyor…');

  // Nullable ekle, mevcutları Pzt (1) say
  await prisma.$executeRawUnsafe(`ALTER TABLE "TimeSlot" ADD COLUMN "dayOfWeek" INTEGER`);
  await prisma.$executeRawUnsafe(`UPDATE "TimeSlot" SET "dayOfWeek" = 1 WHERE "dayOfWeek" IS NULL`);

  // Eski (personnelId, time) unique'i kaldır — duplikasyona yer açıyoruz
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" DROP CONSTRAINT IF EXISTS "TimeSlot_personnelId_time_key"`
  );
  await prisma.$executeRawUnsafe(
    `DROP INDEX IF EXISTS "TimeSlot_personnelId_active_order_idx"`
  );

  // Mevcut Pzt kayıtlarını oku, Salı..Cmt için kopyala
  const day1 = await prisma.$queryRawUnsafe(
    `SELECT "personnelId", time, "order", active FROM "TimeSlot" WHERE "dayOfWeek" = 1`
  );
  for (const row of day1) {
    for (const d of [2, 3, 4, 5, 6]) {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "TimeSlot" (id, time, "dayOfWeek", "order", active, "personnelId", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          'tsdow_' + Math.random().toString(36).slice(2) + Date.now().toString(36) + d,
          row.time,
          d,
          row.order ?? 0,
          row.active ?? true,
          row.personnelId
        );
      } catch (e) {
        // duplicate olabilir; sessiz geç
      }
    }
  }

  // NOT NULL + yeni unique + index
  await prisma.$executeRawUnsafe(`ALTER TABLE "TimeSlot" ALTER COLUMN "dayOfWeek" SET NOT NULL`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_personnelId_dayOfWeek_time_key"
       UNIQUE ("personnelId", "dayOfWeek", "time")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "TimeSlot_personnelId_dayOfWeek_active_order_idx"
       ON "TimeSlot" ("personnelId", "dayOfWeek", "active", "order")`
  );
  console.log('[migrate-timeslots] dayOfWeek tamam.');
}

async function backfillEmptyPersonnelDays() {
  // (personel, gün) çiftleri arasında saati hiç olmayanları bul
  const empty = await prisma.$queryRawUnsafe(`
    WITH days(d) AS (VALUES (1),(2),(3),(4),(5),(6))
    SELECT p.id AS "personnelId", days.d AS "dayOfWeek"
    FROM "Personnel" p CROSS JOIN days
    LEFT JOIN "TimeSlot" ts
      ON ts."personnelId" = p.id AND ts."dayOfWeek" = days.d
    GROUP BY p.id, days.d
    HAVING COUNT(ts.id) = 0
  `);
  if (empty.length === 0) {
    console.log('[migrate-timeslots] backfill: tüm (personel, gün) dolu.');
    return;
  }
  console.log(`[migrate-timeslots] backfill: ${empty.length} (personel, gün) için varsayılan saatler ekleniyor…`);
  for (const row of empty) {
    for (let i = 0; i < DEFAULT_SLOTS.length; i++) {
      try {
        await prisma.timeSlot.create({
          data: {
            time: DEFAULT_SLOTS[i],
            dayOfWeek: row.dayOfWeek,
            order: i + 1,
            active: true,
            personnelId: row.personnelId,
          },
        });
      } catch (e) {
        if (!String(e?.message || '').includes('Unique')) {
          console.warn('[migrate-timeslots] backfill insert hata', DEFAULT_SLOTS[i], e?.message);
        }
      }
    }
  }
  console.log('[migrate-timeslots] backfill tamam.');
}

async function main() {
  if (!(await tableExists())) {
    console.log('[migrate-timeslots] TimeSlot tablosu yok, ilk kurulum — atlandı.');
    return;
  }

  await migratePersonnelSchemaIfNeeded();
  await migrateDayOfWeekIfNeeded();

  if (await colExists('dayOfWeek')) {
    await backfillEmptyPersonnelDays();
  }
}

main()
  .catch((err) => {
    console.error('[migrate-timeslots] hata:', err?.message || err);
    process.exitCode = 0; // build kırılmasın
  })
  .finally(() => prisma.$disconnect());
