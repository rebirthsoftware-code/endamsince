import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_REASON = 'Bu tarih aralığında kapalıyız. Lütfen başka bir gün seçin.';

/**
 * SiteContent'teki booking.closure.start/end aralığında verilen tarih (YYYY-MM-DD)
 * varsa { closed: true, reason } döner. Aralık geçersizse veya boşsa { closed: false }.
 * Bitiş tarihi dahildir.
 */
export async function isDateClosed(date: string): Promise<{ closed: boolean; reason?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { closed: false };
  try {
    const rows = await prisma.siteContent.findMany({
      where: { key: { in: ['booking.closure.start', 'booking.closure.end', 'booking.closure.reason'] } },
      select: { key: true, value: true },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    const start = (map['booking.closure.start'] || '').trim();
    const end = (map['booking.closure.end'] || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return { closed: false };
    }
    if (date >= start && date <= end) {
      return { closed: true, reason: (map['booking.closure.reason'] || '').trim() || DEFAULT_REASON };
    }
    return { closed: false };
  } catch {
    return { closed: false };
  }
}
