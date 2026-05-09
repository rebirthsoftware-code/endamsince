import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    if (!personnelId) {
      return NextResponse.json({ slots: [] });
    }
    const slots = await prisma.timeSlot.findMany({
      where: { active: true, personnelId },
      orderBy: [{ order: 'asc' }, { time: 'asc' }],
      select: { time: true },
    });
    return NextResponse.json({ slots: slots.map((s) => s.time) });
  } catch (err) {
    return NextResponse.json({ slots: [] }, { status: 200 });
  }
}
