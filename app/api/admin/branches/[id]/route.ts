import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

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
    for (const k of ['name', 'location', 'image'] as const) {
      if (typeof body[k] === 'string') data[k] = body[k];
    }
    if (body.image === null) data.image = null;
    const updated = await prisma.branch.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}
