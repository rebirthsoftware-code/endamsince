import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPushToPersonnel } from '@/lib/push';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Vercel Cron her 15 dakikada bir çağırır.
 * Önümüzdeki 75 dakika içinde başlayacak APPROVED randevular için
 * personele tek seferlik push bildirimi gönderir.
 *
 * Duplicate önleme: Appointment.reminderSentAt set'liyse atlanır.
 *
 * Auth: env CRON_SECRET varsa Bearer header zorunlu.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }

  const now = new Date();
  const isoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Bugün ve yarınki tarihler — saat string'lerini parse edip filtrelenecek
  const candidateDates = Array.from(new Set([
    isoDate(now),
    isoDate(new Date(now.getTime() + 86_400_000)),
  ]));

  const winEnd = now.getTime() + 75 * 60_000; // 75 dk ileri

  let scanned = 0;
  let notified = 0;
  const errors: string[] = [];

  try {
    const upcoming = await prisma.appointment.findMany({
      where: {
        status: 'APPROVED',
        reminderSentAt: null,
        date: { in: candidateDates },
      } as any,
      select: {
        id: true, customerName: true, customerPhone: true,
        date: true, time: true, personnelId: true,
      },
    });

    for (const a of upcoming) {
      scanned++;
      const target = new Date(`${a.date}T${a.time}:00`).getTime();
      // Geçmişte ya da çok ilerde olanlar atlansın
      if (target <= now.getTime()) continue;
      if (target > winEnd) continue;

      const minutesLeft = Math.max(1, Math.round((target - now.getTime()) / 60_000));
      try {
        const res = await sendPushToPersonnel(prisma, a.personnelId, {
          title: `⏰ Yaklaşan Randevu — ${a.customerName}`,
          body: `${a.time} (${minutesLeft} dk içinde) · ${a.customerPhone}`,
          url: '/panel',
          tag: `reminder-${a.id}`,
        });
        // Push gönderilemese bile (subscription yok) tekrar denenmesin
        await prisma.appointment.update({
          where: { id: a.id },
          data: { reminderSentAt: new Date() } as any,
        });
        if (res.sent > 0) notified++;
      } catch (e: any) {
        errors.push(`${a.id}: ${e?.message || 'push hatası'}`);
      }
    }

    return NextResponse.json({ scanned, notified, errors, when: now.toISOString() });
  } catch (e: any) {
    console.error('Cron remind error:', e);
    return NextResponse.json({ error: e?.message || 'Cron hatası' }, { status: 500 });
  }
}
