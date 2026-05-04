import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
