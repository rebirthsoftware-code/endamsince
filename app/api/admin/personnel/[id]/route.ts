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
    for (const k of ['name', 'role', 'image', 'pinCode', 'branchId'] as const) {
      if (typeof body[k] === 'string') data[k] = body[k];
    }
    if (body.image === null) data.image = null;
    const updated = await prisma.personnel.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
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
    // Önce randevuları temizle (FK)
    await prisma.appointment.deleteMany({ where: { personnelId: id } });
    await prisma.personnel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
