import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Push subscription kaydı oluşturur veya günceller. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personnelId, subscription } = body || {};

    if (!personnelId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    const personnel = await prisma.personnel.findUnique({ where: { id: personnelId } });
    if (!personnel) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
    }

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        personnelId,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        personnelId,
      },
    });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Subscription kaydedilemedi' }, { status: 500 });
  }
}

/** Subscription siler (kullanıcı bildirimleri kapatınca). */
export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint zorunlu' }, { status: 400 });
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
