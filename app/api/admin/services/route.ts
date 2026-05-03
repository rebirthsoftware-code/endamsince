import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const services = await prisma.service.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    const { name, price, duration, description, features, icon, popular, active, order } = body;
    if (!name || !price) {
      return NextResponse.json({ error: 'name ve price zorunlu' }, { status: 400 });
    }
    const created = await prisma.service.create({
      data: {
        name,
        price,
        duration: duration || '',
        description: description || '',
        features: Array.isArray(features) ? features : [],
        icon: icon || '✂️',
        popular: !!popular,
        active: active !== false,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
