/**
 * Personel fotoğraflarını R2 yerine repodan (public/personnel/) servis etme.
 *
 * Neden: r2.dev public dev URL'i rate-limit'li olduğu için fotoğraflar
 * bazen geç yükleniyor, bazen hiç gelmiyordu. Fotoğraf repoya eklenip
 * aşağıdaki haritaya yazıldığında Vercel'in kendi CDN'inden, limitsiz
 * ve hızlı servis edilir.
 *
 * Kullanım:
 *  1. Fotoğrafı public/personnel/<slug>.webp olarak ekle.
 *  2. LOCAL_PERSONNEL_IMAGES'a `slug: '/personnel/<slug>.webp'` satırı ekle.
 *     Slug = personel adının slugifyName() çıktısı
 *     (ör. "Miraç Yiğit AYHAN" → "mirac-yigit-ayhan").
 *
 * Haritada kaydı OLMAYAN personel için veritabanındaki (R2) adres
 * kullanılmaya devam eder; yani admin panelden fotoğraf yükleme yeni
 * personel için çalışmaya devam eder. Haritada kaydı olan personelin
 * fotoğrafını değiştirmek için repodaki dosyayı değiştirmek gerekir.
 */

export function slugifyName(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const LOCAL_PERSONNEL_IMAGES: Record<string, string> = {
  // Fotoğraflar repoya eklendikçe buraya kayıt düşülecek, örn:
  // 'mirac-yigit-ayhan': '/personnel/mirac-yigit-ayhan.webp',
};

/** Personel kaydının image alanını, repoda yerel fotoğrafı varsa onunla değiştirir. */
export function withLocalImage<T extends { name: string; image?: string | null }>(p: T): T {
  const local = LOCAL_PERSONNEL_IMAGES[slugifyName(p.name)];
  return local ? { ...p, image: local } : p;
}
