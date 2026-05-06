import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.testimonial.findMany({
    orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { quote, author, location, active, order } = await request.json();
    if (!quote || !author) return NextResponse.json({ error: 'quote ve author zorunlu' }, { status: 400 });
    const created = await prisma.testimonial.create({
      data: {
        quote, author,
        location: location || '',
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
