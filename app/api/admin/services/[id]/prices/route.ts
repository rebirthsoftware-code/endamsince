import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** GET — bir hizmetin tüm şubelerdeki fiyat override'larını döndürür. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    const items = await (prisma as any).servicePrice.findMany({
      where: { serviceId: id },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

/** PUT — bir hizmetin tüm şubelerinin fiyatlarını TEK SEFERDE upsert eder.
 *  Body: [{ branchId, price }] — boş price gönderilen şubelerin override'ı silinir. */
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
    const sp = (prisma as any).servicePrice;
    const ops: Promise<unknown>[] = [];
    for (const row of body) {
      if (!row?.branchId) continue;
      const price = String(row.price ?? '').trim();
      if (price === '') {
        // Override'ı sil
        ops.push(sp.deleteMany({
          where: { serviceId: id, branchId: row.branchId },
        }));
      } else {
        ops.push(sp.upsert({
          where: {
            serviceId_branchId: { serviceId: id, branchId: row.branchId },
          },
          update: { price },
          create: { serviceId: id, branchId: row.branchId, price },
        }));
      }
    }
    await Promise.all(ops);
    const items = await sp.findMany({ where: { serviceId: id } });
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}
