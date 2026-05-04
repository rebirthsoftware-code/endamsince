import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'misc';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Dosya 5MB\'dan büyük olamaz' },
        { status: 413 }
      );
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPEG, PNG, WEBP, GIF kabul ediliyor' },
        { status: 415 }
      );
    }

    // Klasör adlarını sanitize et
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'misc';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(key, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error('Upload hatası:', err);
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 });
  }
}
