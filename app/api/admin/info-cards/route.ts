import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.infoCard.findMany({
    orderBy: [{ group: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { group, icon, title, subtitle, description, bullets, active, order } = await request.json();
    if (!group || !title) return NextResponse.json({ error: 'group ve title zorunlu' }, { status: 400 });
    const created = await prisma.infoCard.create({
      data: {
        group,
        icon: icon || '',
        title,
        subtitle: subtitle || null,
        description: description || '',
        bullets: Array.isArray(bullets) ? bullets : [],
        active: active !== false,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
