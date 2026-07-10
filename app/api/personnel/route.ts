import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withLocalImage } from '@/lib/personnel-images';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  try {
    const personnel = await prisma.personnel.findMany({
      where: branchId ? { branchId } : undefined,
      include: { branch: { select: { id: true, name: true, location: true } } },
    });
    return NextResponse.json(personnel.map(withLocalImage));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}
