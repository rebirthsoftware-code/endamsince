import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const branches = await prisma.branch.findMany();
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}
