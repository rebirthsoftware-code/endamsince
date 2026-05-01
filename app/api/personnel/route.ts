import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  try {
    const personnel = await prisma.personnel.findMany({
      where: branchId ? { branchId } : undefined,
    });
    return NextResponse.json(personnel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}
