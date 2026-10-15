import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');
  const personnelId = searchParams.get('personnelId');

  try {
    const include: Record<string, unknown> = {};
    if (branchId) include.branchPrices = { where: { branchId } };
    if (personnelId) include.personnelPrices = { where: { personnelId } };

    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      ...(branchId || personnelId ? ({ include } as any) : {}),
    });

    if (!branchId && !personnelId) return NextResponse.json(services);

    // Fiyat çözümleme sırası: personel > şube > varsayılan
    const enriched = services.map((s: any) => {
      const personnelOverride = (s.personnelPrices || [])[0];
      const branchOverride = (s.branchPrices || [])[0];
      return {
        ...s,
        price: personnelOverride?.price || branchOverride?.price || s.price,
        branchPrices: undefined, // istemciye sızmasın
        personnelPrices: undefined,
      };
    });
    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
