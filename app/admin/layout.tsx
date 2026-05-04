import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yönetim Paneli',
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Endam Admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
