import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPushToPersonnel } from '@/lib/push';
import { isDateClosed } from '@/lib/closure';

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

    // Pazar günü kapalı
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
    if (m) {
      const dUtc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
      if (dUtc.getUTCDay() === 0) {
        return NextResponse.json(
          { error: 'Pazar günü kapalıyız. Lütfen başka bir gün seçin.' },
          { status: 400 }
        );
      }
    }

    // Yönetici tarafından kapatılmış tarih aralığı kontrolü
    const closure = await isDateClosed(String(date || ''));
    if (closure.closed) {
      return NextResponse.json(
        { error: closure.reason || 'Bu tarih aralığında kapalıyız. Lütfen başka bir gün seçin.' },
        { status: 400 }
      );
    }

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
