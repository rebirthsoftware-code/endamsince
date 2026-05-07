import type { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSiteContent } from '@/lib/content';
import HizmetlerClient from './HizmetlerClient';
import './hizmetler.css';

export const metadata: Metadata = {
  title: 'Hizmetler',
  description: "Endamsince'nin sunduğu premium erkek bakım hizmetleri.",
};

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function HizmetlerPage() {
  const dict = await getSiteContent('hizmetler');

  let services: any[] = [];
  let packages: any[] = [];
  let faqs: any[] = [];
  let branches: any[] = [];

  try {
    [services, packages, faqs, branches] = await Promise.all([
      (prisma as any).service.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: { branchPrices: true },
      }),
      prisma.package.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.faq.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.branch.findMany({ orderBy: { name: 'asc' } }),
    ]);
  } catch (err) {
    console.error('Hizmetler içerik yüklenemedi:', err);
  }

  // İstemci tarafı için sade JSON formatına çevir
  const servicesData = services.map((s: any) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    duration: s.duration,
    description: s.description,
    features: s.features || [],
    popular: s.popular,
    defaultPrice: s.price,
    pricesByBranch: Object.fromEntries(
      (s.branchPrices || []).map((bp: any) => [bp.branchId, bp.price]),
    ),
  }));

  const branchesData = branches.map((b: any) => ({ id: b.id, name: b.name, location: b.location }));

  // Plain dict mapping for client component
  const dictPlain: Record<string, string> = {};
  for (const k of Object.keys(dict)) dictPlain[k] = dict[k];

  return (
    <HizmetlerClient
      services={servicesData}
      packages={packages.map((p: any) => ({
        id: p.id, name: p.name, price: p.price, icon: p.icon,
        services: p.services || [], popular: p.popular,
      }))}
      faqs={faqs.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }))}
      branches={branchesData}
      dict={dictPlain}
    />
  );
}
