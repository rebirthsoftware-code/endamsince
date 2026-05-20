import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isDateClosed } from '@/lib/closure';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// JS Date.getDay(): 0=Pzr, 1=Pzt..6=Cmt
// Şemamız: 1=Pzt..6=Cmt (Pazar yok)
function dayOfWeekFromDateStr(date: string): number | null {
  // YYYY-MM-DD bekleniyor, lokal saat dilimini etkilemesin diye UTC parse
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (isNaN(d.getTime())) return null;
  const js = d.getUTCDay(); // 0..6
  if (js === 0) return 0; // Pazar = kapalı
  return js; // 1..6
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    const date = searchParams.get('date');
    if (!personnelId || !date) {
      return NextResponse.json({ slots: [], closed: false });
    }
    const dow = dayOfWeekFromDateStr(date);
    if (dow === null) {
      return NextResponse.json({ slots: [], closed: false });
    }
    if (dow === 0) {
      return NextResponse.json({ slots: [], closed: true, reason: 'Pazar günü kapalıyız.' });
    }
    const closure = await isDateClosed(date);
    if (closure.closed) {
      return NextResponse.json({ slots: [], closed: true, reason: closure.reason });
    }
    const slots = await prisma.timeSlot.findMany({
      where: { active: true, personnelId, dayOfWeek: dow },
      orderBy: [{ order: 'asc' }, { time: 'asc' }],
      select: { time: true },
    });
    return NextResponse.json({ slots: slots.map((s) => s.time), closed: false });
  } catch (err) {
    return NextResponse.json({ slots: [], closed: false }, { status: 200 });
  }
}
