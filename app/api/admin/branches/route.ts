import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  const list = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(list);
}
