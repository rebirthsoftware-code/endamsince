import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    for (const k of ['group', 'icon', 'title', 'description'] as const) {
      if (typeof body[k] === 'string') data[k] = body[k];
    }
    if (typeof body.subtitle === 'string' || body.subtitle === null) data.subtitle = body.subtitle || null;
    if (Array.isArray(body.bullets)) data.bullets = body.bullets;
    if (typeof body.active === 'boolean') data.active = body.active;
    if (typeof body.order === 'number') data.order = body.order;
    const updated = await prisma.infoCard.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    await prisma.infoCard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
