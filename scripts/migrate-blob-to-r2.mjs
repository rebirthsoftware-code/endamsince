// Vercel Blob → Cloudflare R2 migration
//
// Kullanım:
//   node scripts/migrate-blob-to-r2.mjs --dry-run    (sadece listele, değiştirme)
//   node scripts/migrate-blob-to-r2.mjs              (gerçek migration)
//
// Production DB'ye bağlanır (.env.production'daki DATABASE_URL).

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Önce .env.production'ı yükle (DATABASE_URL production'a işaret etsin)
config({ path: '.env.production', override: true });
// Sonra .env'i yükle (R2 credentials gelir, DATABASE_URL override etmez)
config({ override: false });

const isDryRun = process.argv.includes('--dry-run');

const prisma = new PrismaClient();

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const VERCEL_PATTERN = 'vercel-storage';

async function migrateUrl(oldUrl, folder) {
  const response = await fetch(oldUrl);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());

  const cleanUrl = oldUrl.split('?')[0];
  const ext = (cleanUrl.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (isDryRun) {
    return { newUrl: `${PUBLIC_URL}/${key}`, size: buffer.length };
  }

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return { newUrl: `${PUBLIC_URL}/${key}`, size: buffer.length };
}

async function migrateTable({ name, field, folder, prismaModel }) {
  const records = await prismaModel.findMany({
    where: { [field]: { contains: VERCEL_PATTERN } },
  });

  console.log(`\n📦 ${name}: ${records.length} dosya`);
  let migrated = 0, errors = 0, totalBytes = 0;

  for (const record of records) {
    const oldUrl = record[field];
    const shortOld = oldUrl.slice(-50);
    process.stdout.write(`  ⏳ ${shortOld} ... `);

    try {
      const { newUrl, size } = await migrateUrl(oldUrl, folder);
      totalBytes += size;

      if (!isDryRun) {
        await prismaModel.update({
          where: { id: record.id },
          data: { [field]: newUrl },
        });
      }
      console.log(`✅ ${(size / 1024).toFixed(0)} KB`);
      migrated++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      errors++;
    }
  }

  return { migrated, errors, totalBytes };
}

async function main() {
  console.log(isDryRun
    ? '🔍 DRY RUN — hiçbir şey değişmeyecek\n'
    : '🚀 MIGRATION başlıyor (gerçek değişiklik)\n');

  // Env var sanity check
  const required = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL', 'DATABASE_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('❌ Eksik env değişkenleri:', missing.join(', '));
    process.exit(1);
  }

  console.log(`DB:     ${process.env.DATABASE_URL.slice(0, 50)}...`);
  console.log(`R2:     ${process.env.R2_BUCKET} @ ${process.env.R2_PUBLIC_URL}\n`);

  const tables = [
    { name: 'Branch',      field: 'image', folder: 'branches',  prismaModel: prisma.branch },
    { name: 'Personnel',   field: 'image', folder: 'personnel', prismaModel: prisma.personnel },
    { name: 'GalleryItem', field: 'url',   folder: 'gallery',   prismaModel: prisma.galleryItem },
    { name: 'Product',     field: 'image', folder: 'products',  prismaModel: prisma.product },
    { name: 'SiteContent', field: 'value', folder: 'content',   prismaModel: prisma.siteContent },
  ];

  let totalMigrated = 0, totalErrors = 0, totalBytes = 0;
  for (const table of tables) {
    const result = await migrateTable(table);
    totalMigrated += result.migrated;
    totalErrors += result.errors;
    totalBytes += result.totalBytes;
  }

  console.log(`\n📊 ÖZET`);
  console.log(`   Taşınan:  ${totalMigrated} dosya`);
  console.log(`   Hata:     ${totalErrors}`);
  console.log(`   Toplam:   ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  if (isDryRun) {
    console.log(`\n⚠️  DRY RUN modundaydı. Gerçek migration için --dry-run olmadan çalıştır.`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
