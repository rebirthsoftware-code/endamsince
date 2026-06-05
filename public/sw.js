/* Endamsince Service Worker
   Push bildirimleri + offline fallback */

const VERSION = 'endamsince-v2';

/** Açık olan tüm panel sekmelerine "yenile" mesajı gönder. */
async function broadcastRefresh(payload) {
  try {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      try {
        client.postMessage({ type: 'appointments:refresh', payload: payload || null });
      } catch (_) {}
    }
  } catch (_) {}
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* ── Push event: yeni randevu bildirimi ── */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'Endamsince', body: event.data ? event.data.text() : 'Yeni bildirim' };
  }

  const title = data.title || 'Yeni Randevu';
  const options = {
    body: data.body || 'Bir randevu geldi.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'endamsince-appointment',
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || '/panel',
      ...data,
    },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Açık panel sekmelerinin "Bekleyen" sayısı anında güncellensin.
      broadcastRefresh({ tag: options.tag, data: options.data }),
    ])
  );
});

/* ── Bildirime tıklayınca paneli aç ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/panel';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
