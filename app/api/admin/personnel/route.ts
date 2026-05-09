import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';
import { DEFAULT_SLOTS } from '@/lib/default-slots';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    // Pzt..Cmt × varsayılan saatler
    const slotData = [1, 2, 3, 4, 5, 6].flatMap((day) =>
      DEFAULT_SLOTS.map((time, i) => ({
        time,
        dayOfWeek: day,
        order: i + 1,
        active: true,
      }))
    );
    const created = await prisma.personnel.create({
      data: {
        name,
        role,
        image: image || null,
        pinCode,
        branchId,
        timeSlots: { create: slotData },
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Eklenemedi' }, { status: 500 });
  }
}
