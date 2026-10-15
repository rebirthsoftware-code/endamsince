import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** GET — bir hizmetin tüm personellerdeki fiyat override'larını döndürür. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    const items = await (prisma as any).personnelServicePrice.findMany({
      where: { serviceId: id },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

/** PUT — bir hizmetin personel fiyatlarını TEK SEFERDE upsert eder.
 *  Body: [{ personnelId, price }] — boş price gönderilen personelin override'ı silinir. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Array bekleniyor' }, { status: 400 });
    }
    const psp = (prisma as any).personnelServicePrice;
    const ops: Promise<unknown>[] = [];
    for (const row of body) {
      if (!row?.personnelId) continue;
      const price = String(row.price ?? '').trim();
      if (price === '') {
        // Override'ı sil
        ops.push(psp.deleteMany({
          where: { serviceId: id, personnelId: row.personnelId },
        }));
      } else {
        ops.push(psp.upsert({
          where: {
            serviceId_personnelId: { serviceId: id, personnelId: row.personnelId },
          },
          update: { price },
          create: { serviceId: id, personnelId: row.personnelId, price },
        }));
      }
    }
    await Promise.all(ops);
    const items = await psp.findMany({ where: { serviceId: id } });
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}
