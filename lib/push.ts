import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:info@endamsince.com';
  if (!pub || !priv) {
    throw new Error('VAPID anahtarları tanımlı değil (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).');
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Belirli personele push gönder. Geçersiz subscription'ları (404/410) DB'den siler.
 */
export async function sendPushToPersonnel(
  prisma: PrismaClient,
  personnelId: string,
  payload: PushPayload
) {
  ensureConfigured();

  const subs = await prisma.pushSubscription.findMany({ where: { personnelId } });
  if (subs.length === 0) return { sent: 0, removed: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  const toRemove: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          {
            // Hızlı teslim için yüksek urgency + kısa TTL
            urgency: 'high',
            TTL: 60,
          }
        );
        sent++;
      } catch (err: any) {
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          toRemove.push(s.id);
        } else {
          console.error('Push gönderim hatası:', err?.statusCode, err?.body);
        }
      }
    })
  );

  if (toRemove.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: toRemove } } });
  }

  return { sent, removed: toRemove.length };
}
