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

/**
 * Panel üzerinden manuel saat bloklama. Telefonla arayan müşteri için
 * detay tutmadan sadece o saat dilimini doluya alır. customerName ve
 * customerPhone "Manuel Blok" / "-" olarak işaretlenir; bu sayede
 * gerçek müşteri randevularından ayırt edilebilir (gerçek randevular
 * yanlışlıkla silinmesin diye). Status APPROVED, push gönderilmez.
 */
const MANUAL_BLOCK_NAME = 'Manuel Blok';
const MANUAL_BLOCK_PHONE = '-';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personnelId, date, time } = body;

    if (!personnelId || !date || !time) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        personnelId,
        date,
        time,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Bu saat zaten dolu.' },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        personnelId,
        customerName: MANUAL_BLOCK_NAME,
        customerPhone: MANUAL_BLOCK_PHONE,
        date,
        time,
        status: 'APPROVED',
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Saat bloklanamadı' }, { status: 500 });
  }
}
