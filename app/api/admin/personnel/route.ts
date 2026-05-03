import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const list = await prisma.personnel.findMany({
    include: { branch: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    const { name, role, image, pinCode, branchId } = body;
    if (!name || !role || !pinCode || !branchId) {
      return NextResponse.json(
        { error: 'name, role, pinCode, branchId zorunlu' },
        { status: 400 }
      );
    }
    const created = await prisma.personnel.create({
      data: {
        name,
        role,
        image: image || null,
        pinCode,
        branchId,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Eklenemedi' }, { status: 500 });
  }
}
