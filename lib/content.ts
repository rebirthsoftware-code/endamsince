import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Site içerik metinlerini map olarak döndürür.
 * Sayfada `dict('key.path') ?? 'fallback'` şeklinde kullanılır.
 */
export async function getSiteContent(group?: string): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteContent.findMany({
      where: group ? { group } : undefined,
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch (err) {
    console.error('SiteContent yüklenemedi:', err);
    return {};
  }
}

/** Map üzerinde tek değer alıp boş ise fallback'e düşer. */
export function pick(
  map: Record<string, string>,
  key: string,
  fallback: string = ''
): string {
  const v = map[key];
  return (v === undefined || v === null || v === '') ? fallback : v;
}
