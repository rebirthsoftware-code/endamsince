/* Endamsince Service Worker
   Push bildirimleri + offline fallback */

const VERSION = 'endamsince-v1';

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

  event.waitUntil(self.registration.showNotification(title, options));
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
