import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_PIN tanımlı değil' },
      { status: 500 }
    );
  }
  try {
    const { pin } = await request.json();
    if (pin !== expected) {
      return NextResponse.json({ error: 'Hatalı PIN' }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch (_) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
}
