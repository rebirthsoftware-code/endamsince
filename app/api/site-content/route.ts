import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group');
  try {
    const items = await prisma.siteContent.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
