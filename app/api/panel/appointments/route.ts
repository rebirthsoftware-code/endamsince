import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const personnelId = searchParams.get('personnelId');

  if (!personnelId) {
    return NextResponse.json({ error: 'Missing personnelId' }, { status: 400 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { personnelId },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
