import { getServiceBySlug } from './services-data';
import type { ServiceForTemplate } from '@/components/services/ServicePageTemplate';

/**
 * Enriches a DB service with fallback data from services-data for display.
 * Use when DB fields (benefits, processingTime, etc.) are empty.
 */
export function enrichServiceForDisplay(
  service: Record<string, unknown>
): ServiceForTemplate {
  const slug = service.slug as string;
  if (!slug) return service as unknown as ServiceForTemplate;

  const staticService = getServiceBySlug(slug);
  if (!staticService) return service as unknown as ServiceForTemplate;

  const enriched = { ...service } as unknown as ServiceForTemplate;

  if (!(service.benefits as string[])?.length && staticService.benefits?.length) {
    enriched.benefits = staticService.benefits;
  }

  if (!(service.processingTime as string)?.trim() && staticService.processingTime) {
    enriched.processingTime = staticService.processingTime;
  }

  return enriched;
}
