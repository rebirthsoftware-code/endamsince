'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Props = {
  label?: string;
  className?: string;
  /** iOS Safari'de install promptu yok; iPhone'lara yönerge göster */
  showIosHint?: boolean;
};

export default function InstallButton({ label = '📱 Uygulamayı Yükle', className, showIosHint = true }: Props) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // Standalone modda zaten yüklü
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

  const handleClick = async () => {
    if (event) {
      await event.prompt();
      try {
        const { outcome } = await event.userChoice;
        if (outcome === 'accepted') setInstalled(true);
      } catch {}
      setEvent(null);
      return;
    }
    if (isIos && showIosHint) {
      setIosHint(true);
    }
  };

  // Hiçbir destek yoksa (masaüstü Firefox vs.) butonu gizle
  if (!event && !isIos) return null;

  return (
    <>
      <button type="button" className={className || 'admin-logout'} onClick={handleClick} title="Yönetim panelini ana ekrana ekle">
        {label}
      </button>
      {iosHint && (
        <div
          onClick={() => setIosHint(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16, cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111', color: '#fff', borderRadius: 14, padding: 24,
              maxWidth: 360, lineHeight: 1.6, cursor: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 12, color: '#E8591A' }}>iPhone'a Yükleme</h3>
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              <li>Safari'de bu sayfayı açın.</li>
              <li>Alt çubuktaki <strong>Paylaş</strong> ikonuna ⬆ dokunun.</li>
              <li><strong>"Ana Ekrana Ekle"</strong> seçeneğini bulun.</li>
              <li>Sağ üstten <strong>Ekle</strong>'ye dokunun.</li>
            </ol>
            <button
              onClick={() => setIosHint(false)}
              style={{
                marginTop: 16, width: '100%', padding: '10px 16px',
                background: '#E8591A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
}
