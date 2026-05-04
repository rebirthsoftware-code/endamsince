'use client';
import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Props = { personnelId: string };

export default function PushSubscribeButton({ personnelId }: Props) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (!ok || !personnelId) return;
    setPermission(Notification.permission);

    // Bu cihazda mevcut subscription varsa, oturum açan personele bağlı
    // olarak DB'yi otomatik senkronize et. Aksi takdirde bir önceki
    // personele bildirim akmaya devam eder.
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
      if (sub) {
        try {
          await fetch('/api/panel/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personnelId, subscription: sub.toJSON() }),
          });
        } catch (_) {}
      }
    });
  }, [personnelId]);

  const enable = async () => {
    setBusy(true);
    setMsg('');
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setMsg('Bildirim izni reddedildi.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!pubKey) {
        setMsg('Sunucu yapılandırması eksik.');
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey),
      });
      const res = await fetch('/api/panel/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        setMsg('Kaydedilemedi.');
        return;
      }
      setSubscribed(true);
      setMsg('Bildirimler açık.');
    } catch (err) {
      console.error(err);
      setMsg('Bir hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMsg('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/panel/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMsg('Bildirimler kapatıldı.');
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return (
      <div className="push-box push-box-warn">
        Bu cihaz/tarayıcı bildirimleri desteklemiyor. iPhone'da paneli önce ana ekrana ekleyin.
      </div>
    );
  }

  return (
    <div className="push-box">
      <div className="push-text">
        <strong>Push Bildirimleri</strong>
        <span>{subscribed ? 'Yeni randevular için bildirim alıyorsun.' : 'Yeni randevular için bildirimleri aç.'}</span>
      </div>
      {subscribed ? (
        <button className="btn btn-outline btn-sm" disabled={busy} onClick={disable}>
          Kapat
        </button>
      ) : (
        <button className="btn btn-primary btn-sm" disabled={busy || permission === 'denied'} onClick={enable}>
          {permission === 'denied' ? 'İzin Reddedildi' : 'Bildirimleri Aç'}
        </button>
      )}
      {msg && <span className="push-msg">{msg}</span>}
    </div>
  );
}
