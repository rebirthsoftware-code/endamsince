import { NextResponse } from 'next/server';

const HEADER_NAME = 'x-admin-pin';

/**
 * Tüm admin API endpoint'lerinin başında çağrılır.
 * Geçersizse 401 NextResponse döner; geçerliyse null döner.
 */
export function requireAdmin(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: 'Admin yapılandırılmamış (ADMIN_PIN env eksik).' },
      { status: 500 }
    );
  }
  const provided = request.headers.get(HEADER_NAME);
  if (provided !== expected) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  return null;
}

export const ADMIN_PIN_HEADER = HEADER_NAME;
