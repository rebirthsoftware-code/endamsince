import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.package.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { name, price, icon, services, popular, active, order } = await request.json();
    if (!name || !price) return NextResponse.json({ error: 'name ve price zorunlu' }, { status: 400 });
    const created = await prisma.package.create({
      data: {
        name, price,
        icon: icon || '✂️',
        services: Array.isArray(services) ? services : [],
        popular: !!popular,
        active: active !== false,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
