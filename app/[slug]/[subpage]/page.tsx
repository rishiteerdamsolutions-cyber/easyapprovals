import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  resolveService,
  RESERVED_PATHS,
  VALID_SUBPAGES,
} from '@/lib/service-resolver';
import ServicePageTemplate from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; subpage: string };
}): Promise<Metadata> {
  const { slug, subpage } = params;
  if (RESERVED_PATHS.has(slug) || !VALID_SUBPAGES.has(subpage))
    return { title: 'Easy Approval' };

  const resolved = await resolveService(slug);
  if (!resolved) return { title: 'Service Not Found | Easy Approval' };

  const name = resolved.service.name as string;
  const subpageLabel = subpage.replace(/-/g, ' ');
  return {
    title: `${name} - ${subpageLabel} | Easy Approval`,
    description: `${name} - ${subpageLabel}. Professional service from Easy Approval.`,
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

  const resolved = await resolveService(slug);
  if (!resolved) {
    notFound();
  }

  const enrichedService = enrichServiceForDisplay(resolved.service);

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
    />
  );
}
