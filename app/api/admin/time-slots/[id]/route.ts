import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';


export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    if (typeof body.active === 'boolean') data.active = body.active;
    if (typeof body.order === 'number') data.order = body.order;
    const updated = await prisma.timeSlot.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const { id } = await params;
  try {
    await prisma.timeSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
