import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { time: 'asc' }],
      select: { time: true },
    });
    return NextResponse.json({ slots: slots.map((s) => s.time) });
  } catch (err) {
    return NextResponse.json({ slots: [] }, { status: 200 });
  }
}
