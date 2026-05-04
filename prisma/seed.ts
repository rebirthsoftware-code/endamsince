import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* ────────── SITE CONTENT (key-value metinler) ────────── */
const SITE_CONTENT: Array<{
  key: string; value: string; label: string; group: string; multiline?: boolean; order?: number;
}> = [
  // ── HEADER / GLOBAL ──
  { key: 'site.name',           value: 'Endamsince Erkek Kuaför', label: 'Site adı',                  group: 'global',  order: 1 },
  { key: 'contact.phone',       value: '+90 (555) 123 45 67',     label: 'Telefon (görünen)',         group: 'contact', order: 1 },
  { key: 'contact.phone.tel',   value: '+905551234567',           label: 'Telefon (tıklanabilir)',    group: 'contact', order: 2 },
  { key: 'contact.email',       value: 'info@endamsince.com',     label: 'E-posta',                   group: 'contact', order: 3 },
  { key: 'contact.career.email', value: 'kariyer@endamsince.com', label: 'Kariyer e-postası',         group: 'contact', order: 4 },
  { key: 'contact.hours',       value: 'Hafta içi 09:00–21:00',   label: 'Çalışma saatleri',          group: 'contact', order: 5 },
  { key: 'social.instagram',    value: '#',                       label: 'Instagram URL',             group: 'contact', order: 10 },
  { key: 'social.twitter',      value: '#',                       label: 'Twitter/X URL',             group: 'contact', order: 11 },
  { key: 'social.youtube',      value: '#',                       label: 'YouTube URL',               group: 'contact', order: 12 },

  // ── HOMEPAGE HERO ──
  { key: 'home.hero.label.top',     value: 'Est. 1979 — Zonguldak',         label: 'Hero üst etiket sol',  group: 'home', order: 1 },
  { key: 'home.hero.label.right',   value: '[ Plus · Urban · Junior ]',     label: 'Hero üst etiket sağ',  group: 'home', order: 2 },
  { key: 'home.hero.eyebrow',       value: 'Erkek Bakımında Yeni Bir Çağ',  label: 'Hero küçük üst yazı',  group: 'home', order: 3 },
  { key: 'home.hero.title.1',       value: 'Tarzınızı',                     label: 'Hero başlık 1. satır', group: 'home', order: 4 },
  { key: 'home.hero.title.2',       value: 'Keskinleştirin',                label: 'Hero başlık 2. satır (turuncu italik)', group: 'home', order: 5 },
  { key: 'home.hero.tagline.em',    value: 'Sıradan bir tıraş değil,',      label: 'Hero alıntı vurgu',    group: 'home', order: 6, multiline: false },
  { key: 'home.hero.tagline.body',  value: 'kendinize en değerli\nzaman dilimi.', label: 'Hero alıntı gövde (\\n yeni satır)', group: 'home', order: 7, multiline: true },
  { key: 'home.hero.cta.primary',   value: 'Randevu Al',                    label: 'Hero ana buton',       group: 'home', order: 8 },
  { key: 'home.hero.cta.secondary', value: 'Hizmetleri Keşfet',             label: 'Hero ikincil buton',   group: 'home', order: 9 },
  { key: 'home.hero.scrollcue',     value: 'Aşağı kaydır',                  label: 'Hero alt kaydır metni',group: 'home', order: 10 },

  // ── HOMEPAGE MARQUEE ──
  { key: 'home.marquee', value: 'ERKEK BAKIMI • ZİRVE DENEYİMİ • KLASİK USTURA • MODERN KESİM • ENDAMSINCE ZONGULDAK', label: 'Yürüyen yazı (• ile ayır)', group: 'home', order: 11, multiline: true },

  // ── HOMEPAGE INTRO ──
  { key: 'home.intro.title.1',  value: 'Sıradan değil,',                                     label: 'Intro başlık 1', group: 'home', order: 20 },
  { key: 'home.intro.title.2',  value: 'efsanevi',                                           label: 'Intro başlık 2 (turuncu)', group: 'home', order: 21 },
  { key: 'home.intro.title.3',  value: 'bir tıraş.',                                         label: 'Intro başlık 3', group: 'home', order: 22 },
  { key: 'home.intro.body',     value: "1979'dan bu yana erkek bakımını bir sanat formu olarak ele alıyoruz. Klasik berber kültürünü modern ve lüks bir atmosferle harmanlayan salonlarımızda her müşteri özel muamele görür. Plus, Urban ve Junior şubelerimizle Zonguldak'ın en prestijli berber deneyimini sunuyoruz.", label: 'Intro paragrafı', group: 'home', order: 23, multiline: true },
  { key: 'home.intro.cta',      value: 'Hikayemizi Oku',                                     label: 'Intro buton', group: 'home', order: 24 },

  // ── HOMEPAGE ABOUT-SPLIT ──
  { key: 'home.split.badge.value',  value: '45+',              label: 'Görsel rozet rakam',   group: 'home', order: 30 },
  { key: 'home.split.badge.label',  value: 'Yıllık Tecrübe',   label: 'Görsel rozet etiket',  group: 'home', order: 31 },
  { key: 'home.split.title.1',      value: 'Her Detay',        label: 'Split başlık 1',       group: 'home', order: 32 },
  { key: 'home.split.title.2',      value: 'Sizin İçin',       label: 'Split başlık 2',       group: 'home', order: 33 },
  { key: 'home.split.body',         value: 'Kullanılan ürünlerden sunulan ikramlara kadar her detay özenle seçildi. Kapıdan girer girmez kendinizi özel hissedeceğiniz, tıraş koltuğunda kahvenizi yudumlarken tarzınızı usta ellere bırakacağınız bir deneyim.', label: 'Split paragraf', group: 'home', order: 34, multiline: true },

  // ── HOMEPAGE TESTI HEADER ──
  { key: 'home.testi.indextitle',   value: 'Görüşler', label: 'Görüşler bölüm başlığı', group: 'home', order: 40 },

  // ── HOMEPAGE CTA ──
  { key: 'home.cta.eyebrow',  value: 'Online Rezervasyon', label: 'CTA üst etiket',     group: 'home', order: 50 },
  { key: 'home.cta.title.1',  value: 'Randevunuzu',         label: 'CTA başlık 1',       group: 'home', order: 51 },
  { key: 'home.cta.title.2',  value: 'Hemen Alın',          label: 'CTA başlık 2 (turuncu)', group: 'home', order: 52 },
  { key: 'home.cta.button',   value: 'Randevu Oluştur',     label: 'CTA buton',          group: 'home', order: 53 },

  // ── HAKKIMIZDA ──
  { key: 'about.hero.eyebrow',    value: 'Bizi Tanıyın',                                                         label: 'Hero üst etiket',  group: 'about', order: 1 },
  { key: 'about.hero.title.1',    value: "Endamsince'nin",                                                       label: 'Hero başlık 1',    group: 'about', order: 2 },
  { key: 'about.hero.title.2',    value: 'Hikayesi',                                                             label: 'Hero başlık 2 (turuncu)', group: 'about', order: 3 },
  { key: 'about.hero.body',       value: "1979'dan bu yana Zonguldak'ta köklü erkek bakım zinciri olarak faaliyet gösteriyoruz.", label: 'Hero alt paragraf', group: 'about', order: 4, multiline: true },
  { key: 'about.story.eyebrow',   value: 'Hikayemiz',                                                            label: 'Story üst etiket', group: 'about', order: 10 },
  { key: 'about.story.title.1',   value: 'Tutkunun',                                                             label: 'Story başlık 1',   group: 'about', order: 11 },
  { key: 'about.story.title.2',   value: 'Doğurduğu',                                                            label: 'Story başlık 2 (turuncu)', group: 'about', order: 12 },
  { key: 'about.story.title.3',   value: 'Marka',                                                                label: 'Story başlık 3',   group: 'about', order: 13 },
  { key: 'about.story.p1',        value: "Endamsince, erkek bakımına duyulan derin tutku ve klasik berber geleneğini yaşatma istesiyle 1979 yılında Zonguldak'ta kuruldu. Kurucularımız, berberlığin en ince ayrıntılarına verilen özenle Zonguldak'a farklı bir soluk getirdi.", label: 'Story paragraf 1', group: 'about', order: 14, multiline: true },
  { key: 'about.story.p2',        value: 'İlk günden itibaren "sıradan tıraş" anlayışını reddettik. Her müşteri, kapıdan girer girmez kendini özel hissetmeli; çıktığında ise en iyi halini taşımalı — bu bizim temel ilkemiz.', label: 'Story paragraf 2', group: 'about', order: 15, multiline: true },
  { key: 'about.story.p3',        value: "Bugün 3 şube, 12 uzman stilist ve 15.000'den fazla memnun müşteri ile Zonguldak'ın lider erkek bakım markası konumundayız.", label: 'Story paragraf 3', group: 'about', order: 16, multiline: true },
  { key: 'about.story.badge.val', value: '10+',           label: 'Görsel rozet rakam',  group: 'about', order: 17 },
  { key: 'about.story.badge.lbl', value: 'Yıllık Tecrübe', label: 'Görsel rozet etiket', group: 'about', order: 18 },
  { key: 'about.timeline.eyebrow', value: 'Yolculuğumuz',  label: 'Timeline üst etiket',  group: 'about', order: 30 },
  { key: 'about.timeline.title.1', value: 'Kilometre',     label: 'Timeline başlık 1',    group: 'about', order: 31 },
  { key: 'about.timeline.title.2', value: 'Taşları',       label: 'Timeline başlık 2 (turuncu)', group: 'about', order: 32 },
  { key: 'about.values.eyebrow',   value: 'Temel İlkeler', label: 'Değerler üst etiket',  group: 'about', order: 40 },
  { key: 'about.values.title.1',   value: 'Bizi',          label: 'Değerler başlık 1',    group: 'about', order: 41 },
  { key: 'about.values.title.2',   value: 'Biz Yapan',     label: 'Değerler başlık 2 (turuncu)', group: 'about', order: 42 },
  { key: 'about.values.title.3',   value: 'Değerler',      label: 'Değerler başlık 3',    group: 'about', order: 43 },
  { key: 'about.mv.eyebrow',       value: 'Değerlerimiz',   label: 'Misyon/Vizyon üst etiket', group: 'about', order: 50 },
  { key: 'about.mv.title.1',       value: 'Misyon &',       label: 'M/V başlık 1',         group: 'about', order: 51 },
  { key: 'about.mv.title.2',       value: 'Vizyon',         label: 'M/V başlık 2 (turuncu)', group: 'about', order: 52 },
  { key: 'about.cta.title',        value: 'Hikayemizin Bir Parçası Olun', label: 'CTA başlık', group: 'about', order: 60 },
  { key: 'about.cta.body',         value: 'Tarzınızı usta ellere teslim edin. Kolayca online randevu alın.', label: 'CTA alt yazı', group: 'about', order: 61, multiline: true },
  { key: 'about.cta.button',       value: 'Randevu Al →',   label: 'CTA buton',           group: 'about', order: 62 },

  // ── HİZMETLER ──
  { key: 'hizmetler.hero.eyebrow', value: 'Ne Sunuyoruz',         label: 'Hero üst etiket', group: 'hizmetler', order: 1 },
  { key: 'hizmetler.hero.title.1', value: 'Premium',              label: 'Hero başlık 1',   group: 'hizmetler', order: 2 },
  { key: 'hizmetler.hero.title.2', value: 'Hizmetlerimiz',        label: 'Hero başlık 2 (turuncu)', group: 'hizmetler', order: 3 },
  { key: 'hizmetler.hero.body',    value: 'Erkek bakımında sınırları zorluyoruz. Her hizmet uzman eller ve kaliteli ürünlerle sunulur.', label: 'Hero alt paragraf', group: 'hizmetler', order: 4, multiline: true },
  { key: 'hizmetler.pkg.eyebrow',  value: 'Paketler',             label: 'Paket bölüm etiketi', group: 'hizmetler', order: 10 },
  { key: 'hizmetler.pkg.title.1',  value: 'Kombine',              label: 'Paket başlık 1',  group: 'hizmetler', order: 11 },
  { key: 'hizmetler.pkg.title.2',  value: 'Paketler',             label: 'Paket başlık 2 (turuncu)', group: 'hizmetler', order: 12 },
  { key: 'hizmetler.pkg.body',     value: 'Birden fazla hizmeti birleştirerek daha avantajlı fiyatlardan yararlanın.', label: 'Paket açıklama', group: 'hizmetler', order: 13, multiline: true },
  { key: 'hizmetler.faq.eyebrow',  value: 'Sıkça Sorulanlar',     label: 'SSS üst etiket',  group: 'hizmetler', order: 20 },
  { key: 'hizmetler.faq.title.1',  value: 'Merak',                label: 'SSS başlık 1',    group: 'hizmetler', order: 21 },
  { key: 'hizmetler.faq.title.2',  value: 'Ettikleriniz',         label: 'SSS başlık 2 (turuncu)', group: 'hizmetler', order: 22 },

  // ── ÜRÜNLER ──
  { key: 'urunler.hero.eyebrow', value: 'Premium Koleksiyon', label: 'Hero üst etiket', group: 'urunler', order: 1 },
  { key: 'urunler.hero.title.1', value: 'Bakım',              label: 'Hero başlık 1',   group: 'urunler', order: 2 },
  { key: 'urunler.hero.title.2', value: 'Ürünleri',           label: 'Hero başlık 2 (turuncu)', group: 'urunler', order: 3 },
  { key: 'urunler.hero.body',    value: 'Salonlarımızda kullandığımız ve önerdiğimiz dünya markası ürünler.', label: 'Hero alt paragraf', group: 'urunler', order: 4, multiline: true },
  { key: 'urunler.featured.eyebrow', value: 'Öne Çıkan',      label: 'Öne çıkan üst etiket', group: 'urunler', order: 10 },
  { key: 'urunler.featured.badge',   value: 'Ayın Ürünü',     label: 'Öne çıkan rozet',  group: 'urunler', order: 11 },
  { key: 'urunler.grid.eyebrow', value: 'Tüm Ürünler',        label: 'Grid üst etiket',  group: 'urunler', order: 20 },
  { key: 'urunler.grid.title.1', value: 'Koleksiyonu',        label: 'Grid başlık 1',    group: 'urunler', order: 21 },
  { key: 'urunler.grid.title.2', value: 'Keşfet',             label: 'Grid başlık 2 (turuncu)', group: 'urunler', order: 22 },
  { key: 'urunler.quality.eyebrow', value: 'Neden Endamsince?', label: 'Kalite üst etiket', group: 'urunler', order: 30 },
  { key: 'urunler.quality.title.1', value: 'Ürün',           label: 'Kalite başlık 1',  group: 'urunler', order: 31 },
  { key: 'urunler.quality.title.2', value: 'Kalitesi',       label: 'Kalite başlık 2 (turuncu)', group: 'urunler', order: 32 },

  // ── EKİP ──
  { key: 'ekip.hero.eyebrow',  value: 'Profesyonel Ekip',    label: 'Hero üst etiket', group: 'ekip', order: 1 },
  { key: 'ekip.hero.title.1',  value: 'Uzman',               label: 'Hero başlık 1',   group: 'ekip', order: 2 },
  { key: 'ekip.hero.title.2',  value: 'Stilistlerimiz',      label: 'Hero başlık 2 (turuncu)', group: 'ekip', order: 3 },
  { key: 'ekip.hero.body',     value: 'Tarzınızı uluslararası standartlarda eğitim almış uzmanlara teslim edin.', label: 'Hero alt paragraf', group: 'ekip', order: 4, multiline: true },
  { key: 'ekip.career.eyebrow', value: 'Kariyer',             label: 'Kariyer üst etiket', group: 'ekip', order: 10 },
  { key: 'ekip.career.title.1', value: 'Ekibimize',           label: 'Kariyer başlık 1', group: 'ekip', order: 11 },
  { key: 'ekip.career.title.2', value: 'Katılın',             label: 'Kariyer başlık 2 (turuncu)', group: 'ekip', order: 12 },
  { key: 'ekip.career.body',    value: 'Tutkulu ve yetenekli berber / stilistler arıyoruz. Endamsince ailesinin bir parçası olmak ve kariyerinizi zirveye taşımak için bizimle iletişime geçin.', label: 'Kariyer paragraf', group: 'ekip', order: 13, multiline: true },

  // ── FOOTER ──
  { key: 'footer.brand.tagline', value: "Erkek bakımında 45 yıllık deneyim. 1979'dan bu yana Zonguldak'ın köklü berber zinciri.", label: 'Footer kısa açıklama', group: 'footer', order: 1, multiline: true },
  { key: 'footer.copyright',     value: '© 2026 Endamsince Erkek Kuaför. Tüm hakları saklıdır.', label: 'Telif yazısı', group: 'footer', order: 2 },
];

/* ────────── TESTIMONIALS ────────── */
const TESTIMONIALS = [
  { quote: '"Yıllardır aradığım berberi sonunda buldum. Atmosfer ve kahve harika, kesim tam istediğim gibi."', author: 'Ozan T.',     location: 'Plus',   order: 1 },
  { quote: '"Urban şubesindeki hizmet dünya standartlarında. Adeta terapi seansı gibi hissettiriyor."',          author: 'Emirhan K.', location: 'Urban',  order: 2 },
  { quote: '"Personelin ilgisi ve mekanın temizliği üst düzey. Junior için de mükemmel bir tercih."',            author: 'Caner D.',   location: 'Junior', order: 3 },
];

/* ────────── FAQ ────────── */
const FAQS = [
  { question: 'Randevu almak zorunlu mu?',                       answer: 'Randevu almanızı öneririz ancak müsaitlik durumuna göre randevusuz müşteriler de kabul edilir.', order: 1 },
  { question: 'Çocuklar için hizmet var mı?',                    answer: 'Evet, 6 yaş ve üzeri çocuklar için özel indirimli saç kesimi hizmetimiz mevcuttur.',              order: 2 },
  { question: 'Hangi ödeme yöntemleri kabul ediliyor?',          answer: 'Nakit, kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz.',                              order: 3 },
  { question: 'Alerji veya hassasiyetim var, bildirebilir miyim?', answer: 'Kesinlikle. Randevu öncesi stilistinizi bilgilendirmenizi öneririz.',                            order: 4 },
];

/* ────────── PACKAGES ────────── */
const PACKAGES = [
  { name: 'Basic',   price: '450₺',   icon: '✂️', services: ['Saç Kesimi', 'Sakal Şekillendirme', 'Şampuan & Kurutma'], popular: false, order: 1 },
  { name: 'Premium', price: '780₺',   icon: '💈', services: ['Saç Kesimi', 'Klasik Ustura Tıraşı', 'Sakal Şekillendirme', 'Yüz Bakımı', 'Şampuan & Masaj'], popular: true, order: 2 },
  { name: 'VIP',     price: '1.200₺', icon: '👑', services: ['Tüm Premium Hizmetler', 'Renk Uygulaması', 'Keratin Bakımı', 'VIP Lounge', 'İçecek İkramı'], popular: false, order: 3 },
];

/* ────────── PRODUCTS ────────── */
const PRODUCTS = [
  { name: 'Black Gold Wax',       subtitle: 'Güçlü Tutuş · Mat Bitim',  category: 'Styling', price: '₺320', tag: '⭐ Çok Satan',  image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&q=80', description: 'Güçlü tutuş, doğal mat görünüm. Saçınıza ağır koku bırakmadan şekil verin. Endamsince\'nin en çok tercih edilen saç şekillendirme ürünü. Doğal içerikli formülü saç sağlığını korurken şekillendirme gücünü artırır.', featured: true,  order: 1 },
  { name: 'Premium Sakal Yağı',   subtitle: 'Argan + Jojoba Karışımı',  category: 'Sakal',   price: '₺285', tag: '🆕 Yeni',        image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=500&q=80', description: 'Sakalı besler, yumuşatır ve doğal parlaklık katar. Kaşıntıyı giderir.',                                                                                                                                                       featured: false, order: 2 },
  { name: 'Altın Serum',          subtitle: 'Keratin Güçlendirici',     category: 'Saç',     price: '₺410', tag: '💎 Premium',     image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80', description: 'Saç tellerini derinlemesine besler, kırılmayı önler ve ışıl parlaklık verir.',                                                                                                                                                  featured: false, order: 3 },
  { name: 'Hydra Yüz Kremi',      subtitle: 'Derin Nemlendirici',       category: 'Cilt',    price: '₺195', tag: '❤️ Favori',      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80', description: 'Erkek cildine özel formülü ile 24 saat nemlendirme sağlar.',                                                                                                                                                                  featured: false, order: 4 },
  { name: 'Prestige Şampuan',     subtitle: 'Hacim Verici',             category: 'Saç',     price: '₺165', tag: '🌿 Doğal',       image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80', description: 'Saç dibini derinlemesine temizler, hacim ve canlılık kazandırır.',                                                                                                                                                            featured: false, order: 5 },
  { name: 'Clay Pomade',          subtitle: 'Orta Tutuş · Parlak',      category: 'Styling', price: '₺295', tag: '🔥 Trend',       image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80', description: 'Esnek tutuş ve yüksek parlaklık. Günün her saati mükemmel görünüm.',                                                                                                                                                          featured: false, order: 6 },
];

/* ────────── STATS ────────── */
const STATS = [
  // Anasayfa hero
  { value: '15K+', label: 'Mutlu Müşteri', group: 'home-hero',   order: 1 },
  { value: '45+',  label: 'Yıl Deneyim',   group: 'home-hero',   order: 2 },
  { value: '3',    label: 'Şube',           group: 'home-hero',   order: 3 },
  // Hakkımızda story stats
  { value: '2014', label: 'Kuruluş Yılı',   group: 'about-story', order: 1 },
  { value: '15K+', label: 'Mutlu Müşteri',  group: 'about-story', order: 2 },
  { value: '3',    label: 'Premium Şube',   group: 'about-story', order: 3 },
  { value: '12',   label: 'Uzman Stilist',  group: 'about-story', order: 4 },
];

/* ────────── INFO CARDS ────────── */
const INFO_CARDS = [
  // Hakkımızda — Değerler (4 adet)
  { group: 'about-values',   icon: '🎯', title: 'Mükemmellik', description: 'Her kesimde mükemmelliği hedefliyoruz. Detay odaklı yaklaşımımız bizi farklı kılıyor.',           bullets: [], order: 1 },
  { group: 'about-values',   icon: '❤️', title: 'Tutku',       description: 'Berberlik sadece bir meslek değil, bizim için bir sanat formu ve yaşam biçimi.',                  bullets: [], order: 2 },
  { group: 'about-values',   icon: '🤝', title: 'Güven',       description: 'Müşterilerimizle uzun vadeli ilişkiler kuruyoruz. Her ziyaret daha samimi bir deneyim.',          bullets: [], order: 3 },
  { group: 'about-values',   icon: '✨', title: 'Yenilik',     description: 'Klasik kültürü modern tekniklerle harmanlıyoruz. Her daim güncel ve ilerici.',                    bullets: [], order: 4 },

  // Hakkımızda — Misyon/Vizyon
  { group: 'about-mv', icon: '🎯', title: 'Misyonumuz', subtitle: 'mission',
    description: 'Erkek bakımında global standartları yerelde hayata geçirmek. Her müşterimize kişiselleştirilmiş, üst düzey hizmet sunmak ve tarzını en ince detayına kadar mükemmelleştirmasına yardımcı olmak.',
    bullets: ['Kişiye özel kesim ve bakım danışmanlığı', 'Dünya markası premium ürünler kullanımı', 'Sürekli eğitim ile uzman kadro', 'Hijyen ve konfor standartlarını üst düzeyde tutmak'], order: 1 },
  { group: 'about-mv', icon: '🚀', title: 'Vizyonumuz', subtitle: 'vision',
    description: "2030 yılına kadar Türkiye'nin en büyük premium erkek bakım zinciri olmak. Endamsince adını, erkek grooming dünyasında güven ve kaliteyi temsil eden global bir marka haline getirmek.",
    bullets: ['10 şehirde 20+ premium şube hedefi', 'Endamsince Academy eğitim merkezi', 'Özel Endamsince ürün koleksiyonu', 'Dijital randevu ve kişisel bakım takip sistemi'], order: 2 },

  // Hakkımızda — Timeline
  { group: 'about-timeline', icon: '1979', title: 'Kuruluş', description: "Zonguldak'ta ilk Endamsince şubesi açıldı. 3 stilist, 1 ekip.", bullets: [], order: 1 },
  { group: 'about-timeline', icon: '1992', title: 'Büyüme',  description: 'Endam Urban şubesi açıldı. Ekibimiz 6 kişiye ulaştı.',          bullets: [], order: 2 },
  { group: 'about-timeline', icon: '2005', title: 'Ödül',    description: "Zonguldak'un En İyi Erkek Kuaförü ödülünü aldık.",              bullets: [], order: 3 },
  { group: 'about-timeline', icon: '2018', title: 'Premium', description: 'Endam Junior VIP şubesi açıldı. Lüks segment odağı.',           bullets: [], order: 4 },
  { group: 'about-timeline', icon: '2024', title: 'Zirve',   description: '10. yılımızda 15.000 müşteri eşiğini geçtik.',                   bullets: [], order: 5 },

  // Ekip — Kariyer avantajları
  { group: 'team-perks', icon: '📚', title: 'Sürekli Eğitim',   description: 'Yurt içi ve yurt dışı eğitim fırsatları.',          bullets: [], order: 1 },
  { group: 'team-perks', icon: '💰', title: 'Rekabetçi Ücret',  description: 'Sektör ortalamasının üzerinde maaş + prim.',          bullets: [], order: 2 },
  { group: 'team-perks', icon: '🌟', title: 'Kariyer Gelişimi', description: 'Şef stilist ve yönetim pozisyonlarına yükselme.',     bullets: [], order: 3 },
  { group: 'team-perks', icon: '🤝', title: 'Takım Ruhu',       description: 'Destekleyici ve motive edici çalışma ortamı.',        bullets: [], order: 4 },

  // Ürünler — Kalite kartları
  { group: 'product-quality', icon: '🌿', title: 'Doğal İçerikler',   description: 'Tüm ürünlerimizde doğal ve sürdürülebilir hammaddeler kullanılır.', bullets: [], order: 1 },
  { group: 'product-quality', icon: '🔬', title: 'Laboratuvar Testi', description: 'Her ürün, deri testi ve klinik çalışmalardan geçirilmiştir.',       bullets: [], order: 2 },
  { group: 'product-quality', icon: '🏆', title: 'Uzman Onayı',       description: '12 uzman stilistimiz tarafından test edilip önerilmektedir.',         bullets: [], order: 3 },
  { group: 'product-quality', icon: '♻️', title: 'Sürdürülebilir',    description: 'Çevre dostu ambalaj ve üretim süreçleri.',                            bullets: [], order: 4 },
];

/* ────────── HİZMETLER (Service) ────────── */
const SERVICES = [
  { name: 'Saç Tasarımı',          icon: '✂️', price: '350₺', duration: '45 dk', description: 'Yüz hatlarınıza ve saç yapınıza en uygun modern saç kesimleri. Stilistimiz ilk olarak yüz analizinizi yaparak en doğru kesim seçeneğini belirler.', features: ['Saç analizi ve danışmanlık', 'Wash & Cut dahil', 'Şekillendirme ve finish', 'Bakım önerileri'], popular: true,  order: 1 },
  { name: 'Klasik Ustura Tıraşı',  icon: '🪒', price: '280₺', duration: '30 dk', description: 'Geleneksel tek kullanımlık ustura ile terleyici havlu ritüeli. Yüz masajı ve serinleme losyonu dahil.', features: ['Sıcak havlu ritueli', 'Pre-shave yağı', 'Ustura tıraşı', 'After-shave bakımı'], popular: false, order: 2 },
  { name: 'Sakal Şekillendirme',   icon: '💈', price: '200₺', duration: '25 dk', description: 'Yüz hatlarınıza en uygun sakal şeklini belirler, kesim ve bakımını profesyonelce yaparız.', features: ['Sakal şekil danışmanlığı', 'Trimming & edging', 'Sakal yağı uygulaması', 'Şekil tıraşı'], popular: false, order: 3 },
  { name: 'Derin Yüz Bakımı',      icon: '🧴', price: '450₺', duration: '60 dk', description: 'Erkek cildine özel derinlemesine temizlik, nemlendirme ve yenileme bakımı.', features: ['Cilt tipi analizi', 'Derin gözenek temizliği', 'Serum & maske uygulaması', 'Masaj ve nemlendirme'], popular: false, order: 4 },
  { name: 'Renk & Beyaz Kapama',   icon: '🎨', price: '600₺+', duration: '90 dk', description: 'Doğal görünümlü beyaz saç kapama ve modern saç renklendirme işlemleri.', features: ['Saç renk analizi', 'Boyama uygulaması', 'Renk sabitleme bakımı', 'Kurutma & şekillendirme'], popular: false, order: 5 },
  { name: 'Saç & Deri Bakımı',     icon: '💆', price: '320₺', duration: '50 dk', description: 'Saç dibi ve saç teli için kapsamlı besleyici bakım. Kepek ve kırılma karşıtı formüller.', features: ['Kepek analizi', 'Saç dibi masajı', 'Keratin bakımı', 'Onarıcı maske'], popular: false, order: 6 },
];

async function main() {
  console.log('Start seeding ...');

  // Mevcut randevu/personel/şubeleri sıfırla (geliştirme tohumu)
  await prisma.appointment.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.service.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.package.deleteMany();
  await prisma.product.deleteMany();
  await prisma.stat.deleteMany();
  await prisma.infoCard.deleteMany();
  // SiteContent UPSERT — silmiyoruz, varolanları korur, eksikleri ekler
  for (const c of SITE_CONTENT) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: { label: c.label, group: c.group, multiline: !!c.multiline, order: c.order ?? 0 },
      create: c,
    });
  }
  console.log(`✓ ${SITE_CONTENT.length} site içeriği yüklendi.`);

  // Branches
  const branch1 = await prisma.branch.create({ data: { name: 'Endamsince Plus',    location: 'Endam Plus — Zonguldak',    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
  const branch2 = await prisma.branch.create({ data: { name: 'Endamsince Urban',   location: 'Endam Urban — Zonguldak',   image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
  const branch3 = await prisma.branch.create({ data: { name: 'Endamsince Junior',  location: 'Endam Junior — Zonguldak',  image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
  console.log('✓ 3 şube eklendi.');

  // Personnel
  const personnelData = [
    { name: 'Ahmet Yılmaz', role: 'Baş Berber',       branchId: branch1.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Mehmet Kaya',  role: 'Saç Stilisti',     branchId: branch1.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Can Demir',    role: 'Sakal Uzmanı',     branchId: branch2.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Burak Şahin',  role: 'VIP Saç Tasarım',  branchId: branch3.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1480429370139-e01abe113bc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Emre Çelik',   role: 'Renk Uzmanı',      branchId: branch3.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ];
  for (const p of personnelData) await prisma.personnel.create({ data: p });
  console.log(`✓ ${personnelData.length} personel eklendi.`);

  // Time slots
  const slots = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
  for (let i = 0; i < slots.length; i++) {
    await prisma.timeSlot.create({ data: { time: slots[i], order: i + 1 } });
  }
  console.log(`✓ ${slots.length} randevu saati eklendi.`);

  // Services
  for (const s of SERVICES) await prisma.service.create({ data: s });
  console.log(`✓ ${SERVICES.length} hizmet eklendi.`);

  // Testimonials
  for (const t of TESTIMONIALS) await prisma.testimonial.create({ data: t });
  console.log(`✓ ${TESTIMONIALS.length} görüş eklendi.`);

  // FAQ
  for (const f of FAQS) await prisma.faq.create({ data: f });
  console.log(`✓ ${FAQS.length} SSS eklendi.`);

  // Packages
  for (const p of PACKAGES) await prisma.package.create({ data: p });
  console.log(`✓ ${PACKAGES.length} paket eklendi.`);

  // Products
  for (const p of PRODUCTS) await prisma.product.create({ data: p });
  console.log(`✓ ${PRODUCTS.length} ürün eklendi.`);

  // Stats
  for (const s of STATS) await prisma.stat.create({ data: s });
  console.log(`✓ ${STATS.length} istatistik eklendi.`);

  // InfoCards
  for (const c of INFO_CARDS) await prisma.infoCard.create({ data: c });
  console.log(`✓ ${INFO_CARDS.length} kart eklendi.`);

  console.log('Seeding finished.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
