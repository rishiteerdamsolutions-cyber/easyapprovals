import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import ServicePageTemplate from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: 'Service Not Found' };
  const name = service.name as string;
  const desc = (service.description as string) || `${name} - Professional service from Easy Approval`;
  return {
    title: `${name} | Easy Approval`,
    description: desc.slice(0, 160),
  };
}

async function getService(slug: string) {
  await connectDB();
  const service = await Service.findOne({ slug, isActive: true })
    .populate('categoryId', 'name slug')
    .lean();
  return service ? JSON.parse(JSON.stringify(service)) : null;
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = await getService(params.slug);

  if (!service) {
    notFound();
  }

  const enrichedService = enrichServiceForDisplay(service);

  return <ServicePageTemplate service={enrichedService} />;
}
