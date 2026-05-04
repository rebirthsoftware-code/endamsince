import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.stat.findMany({
    orderBy: [{ group: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { value, label, group, active, order } = await request.json();
    if (!value || !label || !group) return NextResponse.json({ error: 'value, label, group zorunlu' }, { status: 400 });
    const created = await prisma.stat.create({
      data: {
        value, label, group,
        active: active !== false,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
