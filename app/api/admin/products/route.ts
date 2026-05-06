import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.product.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { name, subtitle, category, price, tag, image, description, featured, active, order } = await request.json();
    if (!name || !price) return NextResponse.json({ error: 'name ve price zorunlu' }, { status: 400 });
    const created = await prisma.product.create({
      data: {
        name,
        subtitle: subtitle || '',
        category: category || '',
        price,
        tag: tag || '',
        image: image || null,
        description: description || '',
        featured: !!featured,
        active: active !== false,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
