import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { resolveServiceWithVariation, RESERVED_PATHS } from '@/lib/service-resolver';
import ServicePageTemplate, { type ServiceForTemplate } from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';
import { getCityName } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const paramsResolved = params instanceof Promise ? await params : params;
  const slug = paramsResolved?.slug ?? '';
  if (RESERVED_PATHS.has(slug)) return { title: 'Easy Approval' };

  const svc = await resolveServiceWithVariation(slug);
  if (!svc) return { title: 'Service Not Found | Easy Approval' };

  const name = svc.service.name as string;
  const cityDisplay = svc.city ? getCityName(svc.city) : undefined;
  const titleName = cityDisplay ? `${name} in ${cityDisplay}` : name;
  const desc =
    (svc.service.description as string) ||
    `${name} - Professional service from Easy Approval`;
  return {
    title: `${titleName} | Easy Approval`,
    description: desc.slice(0, 160),
  };
}

export default async function RootSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const paramsResolved = params instanceof Promise ? await params : params;
  const slug = paramsResolved?.slug ?? '';

  if (RESERVED_PATHS.has(slug)) {
    notFound();
  }

  let svcResolved;
  try {
    svcResolved = await resolveServiceWithVariation(slug);
  } catch (e) {
    console.error('resolveServiceWithVariation error:', e);
    notFound();
  }
  if (!svcResolved) notFound();

  let enrichedService: ServiceForTemplate;
  try {
    enrichedService = enrichServiceForDisplay(svcResolved.service);
  } catch (e) {
    console.error('enrichServiceForDisplay error:', e);
    enrichedService = svcResolved.service as unknown as ServiceForTemplate;
  }
  const variation = (svcResolved.service as { variation?: string }).variation;
  const cityDisplay = svcResolved.city ? getCityName(svcResolved.city) : undefined;

  return (
    <ServicePageTemplate
      service={enrichedService}
      variation={variation}
      city={cityDisplay}
    />
  );
}
