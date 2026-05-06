import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const slots = await prisma.timeSlot.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { time: 'asc' }],
  });
  return NextResponse.json(slots);
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    const { time, order } = await request.json();
    if (!time || !TIME_REGEX.test(String(time))) {
      return NextResponse.json(
        { error: 'Saat HH:MM formatında olmalı (örn: 09:30)' },
        { status: 400 }
      );
    }
    const existing = await prisma.timeSlot.findUnique({ where: { time } });
    if (existing) {
      return NextResponse.json({ error: 'Bu saat zaten ekli.' }, { status: 409 });
    }
    const created = await prisma.timeSlot.create({
      data: {
        time,
        order: typeof order === 'number' ? order : 0,
        active: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Eklenemedi' }, { status: 500 });
  }
}
