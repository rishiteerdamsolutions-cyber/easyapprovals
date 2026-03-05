import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { resolveServiceWithVariation, RESERVED_PATHS } from '@/lib/service-resolver';
import ServicePageTemplate from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';
import { getCityName } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  if (RESERVED_PATHS.has(slug)) return { title: 'Easy Approval' };

  const resolved = await resolveServiceWithVariation(slug);
  if (!resolved) return { title: 'Service Not Found | Easy Approval' };

  const name = resolved.service.name as string;
  const cityDisplay = resolved.city ? getCityName(resolved.city) : undefined;
  const titleName = cityDisplay ? `${name} in ${cityDisplay}` : name;
  const desc =
    (resolved.service.description as string) ||
    `${name} - Professional service from Easy Approval`;
  return {
    title: `${titleName} | Easy Approval`,
    description: desc.slice(0, 160),
  };
}

export default async function RootSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  if (RESERVED_PATHS.has(slug)) {
    notFound();
  }

  const resolved = await resolveServiceWithVariation(slug);
  if (!resolved) {
    notFound();
  }

  const enrichedService = enrichServiceForDisplay(resolved.service);
  const variation = (resolved.service as { variation?: string }).variation;
  const cityDisplay = resolved.city ? getCityName(resolved.city) : undefined;

  return (
    <ServicePageTemplate
      service={enrichedService}
      variation={variation}
      city={cityDisplay}
    />
  );
}
