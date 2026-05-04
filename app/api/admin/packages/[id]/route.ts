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
    for (const k of ['name', 'price', 'icon'] as const) {
      if (typeof body[k] === 'string') data[k] = body[k];
    }
    if (Array.isArray(body.services)) data.services = body.services;
    if (typeof body.popular === 'boolean') data.popular = body.popular;
    if (typeof body.active === 'boolean') data.active = body.active;
    if (typeof body.order === 'number') data.order = body.order;
    const updated = await prisma.package.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request); if (auth) return auth;
  const { id } = await params;
  try {
    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
