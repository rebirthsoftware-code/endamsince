import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personel Paneli',
  manifest: '/manifest-panel.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Endam Panel',
  },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
