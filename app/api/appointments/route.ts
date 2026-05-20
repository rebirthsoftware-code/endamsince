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
    // Dolu sayılanlar = onaylanmış randevular. PENDING'ler aynı saate başka
    // başvuruları engellemez; admin onaylayınca slot kapanır.
    const taken = await prisma.appointment.findMany({
      where: {
        personnelId,
        date,
        status: 'APPROVED',
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

    // Çift rezervasyon önleme: aynı saat sadece ONAYLANMIŞ randevu varsa kapalı.
    // Onaylanmamış (PENDING) başka başvurular varken aynı saate yeni başvuru
    // alınabilir; admin birini onaylayınca slot kapanır.
    const approved = await prisma.appointment.findFirst({
      where: { personnelId, date, time, status: 'APPROVED' },
    });
    if (approved) {
      return NextResponse.json(
        { error: 'Bu saat artık dolu. Lütfen başka bir saat seçin.' },
        { status: 409 }
      );
    }

    // Aynı telefon aynı saate ikinci kez başvuru göndermesin (yanlışlıkla çift tıklamayı önler)
    const duplicate = await prisma.appointment.findFirst({
      where: {
        personnelId, date, time,
        customerPhone,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: 'Bu saat için zaten bir başvurunuz mevcut.' },
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
