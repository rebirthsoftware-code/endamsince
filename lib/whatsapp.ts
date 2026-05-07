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

/** Tarihi okunaklı Türkçe formata çevirir: "Cum, 15 May 2026" */
function formatDateTr(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
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
  const brand = ctx.brand || 'Endamsince Erkek Kuaför';
  const branchLine = ctx.branchName ? `\n📍 Şube: ${ctx.branchName}` : '';
  return (
    `Merhaba ${ctx.customerName},\n\n` +
    `${brand} randevunuz *ONAYLANDI* ✅\n\n` +
    `📅 Tarih: ${formatDateTr(ctx.date)}\n` +
    `🕒 Saat: ${ctx.time}` +
    branchLine + `\n\n` +
    `Sizi bekliyoruz! İptal veya değişiklik için bu mesaja yanıt verebilirsiniz.\n\n` +
    `— ${brand}`
  );
}

/** Hatırlatma mesajı (randevu yaklaşıyor). */
export function reminderMessage(ctx: WhatsAppContext): string {
  const brand = ctx.brand || 'Endamsince Erkek Kuaför';
  const branchLine = ctx.branchName ? `\n📍 ${ctx.branchName}` : '';
  return (
    `Merhaba ${ctx.customerName} 👋\n\n` +
    `Bugün ${ctx.time} saatindeki randevunuz için kibar bir hatırlatma 🔔\n` +
    `📅 ${formatDateTr(ctx.date)}` +
    branchLine + `\n\n` +
    `Yolumuzu bekliyoruz, görüşmek üzere!\n— ${brand}`
  );
}

/** Reddetme mesajı (opsiyonel). */
export function rejectionMessage(ctx: WhatsAppContext): string {
  const brand = ctx.brand || 'Endamsince Erkek Kuaför';
  return (
    `Merhaba ${ctx.customerName},\n\n` +
    `${formatDateTr(ctx.date)} ${ctx.time} için talep ettiğiniz randevu maalesef *uygun değil*.\n\n` +
    `Farklı bir saat/gün için bizi arayabilir veya web sitemizden yeni bir randevu oluşturabilirsiniz.\n\n` +
    `Anlayışınız için teşekkürler 🙏\n— ${brand}`
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
