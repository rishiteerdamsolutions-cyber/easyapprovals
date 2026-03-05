import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  resolveServiceWithVariation,
  RESERVED_PATHS,
  VALID_SUBPAGES,
} from '@/lib/service-resolver';
import ServicePageTemplate from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';
import { getCityName } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; subpage: string };
}): Promise<Metadata> {
  const { slug, subpage } = params;
  if (RESERVED_PATHS.has(slug) || !VALID_SUBPAGES.has(subpage))
    return { title: 'Easy Approval' };

  const resolved = await resolveServiceWithVariation(slug);
  if (!resolved) return { title: 'Service Not Found | Easy Approval' };

  const name = resolved.service.name as string;
  const cityDisplay = resolved.city ? getCityName(resolved.city) : undefined;
  const titleName = cityDisplay ? `${name} in ${cityDisplay}` : name;
  const subpageLabel = subpage.replace(/-/g, ' ');
  return {
    title: `${titleName} - ${subpageLabel} | Easy Approval`,
    description: `${titleName} - ${subpageLabel}. Professional service from Easy Approval.`,
  };
}

export default async function RootSlugSubpagePage({
  params,
}: {
  params: { slug: string; subpage: string };
}) {
  const { slug, subpage } = params;

  if (RESERVED_PATHS.has(slug) || !VALID_SUBPAGES.has(subpage)) {
    notFound();
  }

  const resolved = await resolveServiceWithVariation(slug);
  if (!resolved) {
    notFound();
  }

  const enrichedService = enrichServiceForDisplay(resolved.service);
  const variation = (resolved.service as { variation?: string }).variation;
  const cityDisplay = resolved.city ? getCityName(resolved.city) : undefined;

  const scrollId =
    subpage === 'government-fees'
      ? 'fees'
      : subpage === 'documents'
      ? 'documents-required'
      : subpage;

  return (
    <ServicePageTemplate
      service={enrichedService}
      subpage={scrollId}
      variation={variation}
      city={cityDisplay}
    />
  );
}
