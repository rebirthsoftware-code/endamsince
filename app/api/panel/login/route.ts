import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { personnelId, pinCode } = await request.json();
    
    const personnel = await prisma.personnel.findUnique({
      where: { id: personnelId }
    });

    if (personnel && personnel.pinCode === pinCode) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
