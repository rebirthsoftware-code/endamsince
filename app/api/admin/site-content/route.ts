import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  const items = await prisma.siteContent.findMany({
    orderBy: [{ group: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request); if (auth) return auth;
  try {
    const { key, value, label, group, multiline, order } = await request.json();
    if (!key || !label || !group) return NextResponse.json({ error: 'key, label, group zorunlu' }, { status: 400 });
    const created = await prisma.siteContent.create({
      data: {
        key,
        value: value || '',
        label,
        group,
        multiline: !!multiline,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Bu key zaten kullanımda' }, { status: 409 });
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
  }
}
