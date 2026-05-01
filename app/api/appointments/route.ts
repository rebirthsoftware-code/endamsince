import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personnelId, customerName, customerPhone, date, time } = body;

    const appointment = await prisma.appointment.create({
      data: {
        personnelId,
        customerName,
        customerPhone,
        date,
        time,
        status: 'PENDING'
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
