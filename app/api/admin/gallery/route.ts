import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    const { url, title, category, width, height, order } = body;
    if (!url) return NextResponse.json({ error: 'url zorunlu' }, { status: 400 });
    const created = await prisma.galleryItem.create({
      data: {
        url,
        title: title || null,
        category: category || null,
        width: typeof width === 'number' ? width : null,
        height: typeof height === 'number' ? height : null,
        active: true,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Eklenemedi' }, { status: 500 });
  }
}
