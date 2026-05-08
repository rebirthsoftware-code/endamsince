import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MANUAL_BLOCK_NAME = 'Manuel Blok';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

/** Yalnızca manuel blokları siler — gerçek müşteri randevuları için
 *  PATCH ile status=CANCELLED kullanılmalı (geçmiş kalsın diye). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    }
    if (existing.customerName !== MANUAL_BLOCK_NAME) {
      return NextResponse.json(
        { error: 'Gerçek randevular silinemez. İptal kullanın.' },
        { status: 403 }
      );
    }
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
