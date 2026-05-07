import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      ...(branchId
        ? { include: { branchPrices: { where: { branchId } } } as any }
        : {}),
    });

    if (!branchId) return NextResponse.json(services);

    // Şube fiyatı varsa onu uygula, yoksa default fiyatla bırak
    const enriched = services.map((s: any) => {
      const override = (s.branchPrices || [])[0];
      return {
        ...s,
        price: override?.price || s.price,
        branchPrices: undefined, // istemciye sızmasın
      };
    });
    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
