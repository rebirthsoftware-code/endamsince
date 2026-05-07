/**
 * WhatsApp link helpers — wa.me üzerinden ücretsiz mesaj gönderme.
 * Personelin telefonuna WhatsApp linki açar, mesaj önceden doldurulmuş
 * gelir, personel "Gönder"e basar. SMS gibi ücret yoktur.
 */

/** Türk telefon numarasını uluslararası WhatsApp formatına çevirir.
 *  Örn: '0532 123 45 67', '+90 532 123 45 67', '5321234567' → '905321234567'
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  // Yalnızca rakamları al
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // +90... formundaysa zaten 90 ile başlar (+ silindi)
  if (digits.startsWith('90') && digits.length >= 12) return digits;
  // 0 ile başlıyorsa (Türkiye yerel) → 0'ı at, başına 90 ekle
  if (digits.startsWith('0')) digits = digits.slice(1);
  // 10 haneli (5xx... şeklinde) → başına 90
  if (digits.length === 10) return '90' + digits;
  // Aksi halde olduğu gibi (yurtdışı vs.)
  return digits;
}

/** Tarihi okunaklı Türkçe formata çevirir: "07 Mayıs 2026, Perşembe" */
function formatDateTr(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00');
    const day = d.toLocaleDateString('tr-TR', { day: '2-digit' });
    const month = d.toLocaleDateString('tr-TR', { month: 'long' });
    const year = d.toLocaleDateString('tr-TR', { year: 'numeric' });
    const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' });
    // İlk harf büyük (Mayıs / Perşembe) — locale zaten lowercase dönebilir; güvenceye al
    const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
    return `${day} ${cap(month)} ${year}, ${cap(weekday)}`;
  } catch {
    return iso;
  }
}

/** Bugün mü kontrol et (YYYY-MM-DD) */
function isToday(iso: string): boolean {
  try {
    const d = new Date(iso + 'T00:00:00');
    const t = new Date();
    return d.getFullYear() === t.getFullYear()
      && d.getMonth() === t.getMonth()
      && d.getDate() === t.getDate();
  } catch { return false; }
}

export type WhatsAppContext = {
  customerName: string;
  customerPhone: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  branchName?: string;
  brand?: string;   // varsayılan: Endamsince Erkek Kuaför
};

/** Onay mesajı (randevu APPROVED yapılınca müşteriye gönderilir). */
export function approvalMessage(ctx: WhatsAppContext): string {
  const brand = ctx.brand || 'Endamsince1979';
  const branchLine = ctx.branchName ? `📍 ${ctx.branchName}` : '';
  return (
    `Değerli Müşterimiz ${ctx.customerName},\n\n` +
    `Randevunuz onaylandı, sizi ağırlamak için sabırsızlanıyoruz. ✨\n\n` +
    `🕒 Saat ${ctx.time}\n` +
    `🗓️ ${formatDateTr(ctx.date)}` +
    (branchLine ? `\n${branchLine}` : '') + `\n\n` +
    `Görüşmek üzere!\n— ${brand}`
  );
}

/** Hatırlatma mesajı (randevu yaklaşıyor). */
export function reminderMessage(ctx: WhatsAppContext): string {
  const brand = ctx.brand || 'Endamsince1979';
  const today = isToday(ctx.date);
  const whenLine = today
    ? `Bugün saat ${ctx.time}'deki randevunuzu size ufak bir tebessümle hatırlatmak istedik. 💫`
    : `${ctx.time} saatindeki randevunuzu size ufak bir tebessümle hatırlatmak istedik. 💫`;
  const branchLine = ctx.branchName ? `📍 ${ctx.branchName}` : '';
  return (
    `Değerli Müşterimiz ${ctx.customerName},\n\n` +
    `${whenLine}\n\n` +
    `🗓️ ${formatDateTr(ctx.date)}` +
    (branchLine ? `\n${branchLine}` : '') + `\n\n` +
    `Gününüzü güzelleştirmek için buradayız. Görüşmek dileğiyle!\n— ${brand}`
  );
}

/** Reddetme mesajı (opsiyonel). */
export function rejectionMessage(ctx: WhatsAppContext): string {
  const brand = ctx.brand || 'Endamsince1979';
  return (
    `Değerli Müşterimiz ${ctx.customerName},\n\n` +
    `${formatDateTr(ctx.date)} ${ctx.time} için talep ettiğiniz randevu maalesef uygun değil. 🙏\n\n` +
    `Farklı bir saat/gün için bizi arayabilir veya web sitemizden yeni bir randevu oluşturabilirsiniz.\n\n` +
    `Anlayışınız için teşekkür ederiz.\n— ${brand}`
  );
}

/** wa.me URL'ini hazırlar. Yeni sekmede açılır. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Yardımcı: bir randevuya kalan zamanı saat cinsinden hesaplar. */
export function hoursUntil(date: string, time: string, now: Date = new Date()): number {
  try {
    const target = new Date(`${date}T${time}:00`);
    return (target.getTime() - now.getTime()) / 3_600_000;
  } catch {
    return Infinity;
  }
}
