import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPushToPersonnel } from '@/lib/push';

const prisma = new PrismaClient();

/** Belirli personel + tarih için dolu saatleri döner */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const personnelId = searchParams.get('personnelId');
  const date = searchParams.get('date');

  if (!personnelId || !date) {
    return NextResponse.json({ error: 'personnelId ve date zorunlu' }, { status: 400 });
  }

  try {
    const taken = await prisma.appointment.findMany({
      where: {
        personnelId,
        date,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      select: { time: true },
    });
    return NextResponse.json({ takenTimes: taken.map(t => t.time) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ takenTimes: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personnelId, customerName, customerPhone, date, time } = body;

    // Çift rezervasyon önleme
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
        { error: 'Bu saat artık dolu. Lütfen başka bir saat seçin.' },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        personnelId,
        customerName,
        customerPhone,
        date,
        time,
        status: 'PENDING',
      },
    });

    // İlgili personele push bildirim gönder.
    // Vercel serverless function response döndüğünde çalışmayı sonlandırdığı
    // için push'u burada AWAIT etmemiz gerekiyor. Aksi halde bildirim
    // teslimi yarıda kesilebilir veya çok geç teslim edilir.
    try {
      const result = await sendPushToPersonnel(prisma, personnelId, {
        title: 'Yeni Randevu',
        body: `${customerName} — ${date} ${time}`,
        tag: `appt-${appointment.id}`,
        url: '/panel',
      });
      console.log(
        `[push] personnel=${personnelId} appointment=${appointment.id} sent=${result.sent} removed=${result.removed}`
      );
    } catch (e) {
      console.error('Push gönderilemedi:', e);
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
