import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

/** Slug aliases: alternate URLs that resolve to a canonical service slug */
const SLUG_ALIASES: Record<string, string> = {
  'msme-registration': 'udyam-registration',
  'partnership-firm-registration': 'partnership-registration',
  'limited-liability-partnership-registration': 'llp-registration',
  'one-person-company-registration': 'opc-registration',
  'section-8-company-registration': 'section-8-company-registration', // same
  'import-export-code-registration': 'import-export-code',
  'shop-establishment-license': 'shop-act-registration',
};

export interface ResolvedService {
  service: Record<string, unknown>;
  slug: string;
  subpage?: string;
  city?: string;
}

/**
 * Resolve a slug (and optional alias) to a service from the database.
 * Returns the service document or null if not found.
 */
export async function resolveService(slugOrAlias: string): Promise<ResolvedService | null> {
  const slug = SLUG_ALIASES[slugOrAlias] ?? slugOrAlias;

  await connectDB();
  const service = await Service.findOne({ slug, isActive: true })
    .populate('categoryId', 'name slug')
    .lean();

  if (!service) return null;

  return {
    service: JSON.parse(JSON.stringify(service)),
    slug,
  };
}

/** Common variation suffixes (Layer 2 SEO) - e.g. gst-registration-documents */
export const COMMON_VARIATIONS = new Set([
  'online',
  'documents',
  'fees',
  'process',
  'cancellation',
  'renewal',
  'for-partnership',
  'for-llp',
  'for-proprietorship',
  'time',
]);

/**
 * Resolve slug-variation format (e.g. gst-registration-documents).
 * Tries exact match first, then parses as base-variation.
 */
export async function resolveServiceWithVariation(
  fullSlug: string
): Promise<ResolvedService | null> {
  // Try exact match first
  const exact = await resolveService(fullSlug);
  if (exact) return exact;

  // Parse slug-variation: split from the end, find valid base + variation
  const parts = fullSlug.split('-');
  for (let i = parts.length - 1; i >= 1; i--) {
    const variation = parts.slice(i).join('-');
    const baseSlug = parts.slice(0, i).join('-');

    if (!COMMON_VARIATIONS.has(variation)) continue;

    const resolved = await resolveService(baseSlug);
    if (resolved) {
      const svc = resolved.service as { variations?: string[] };
      const variations = svc?.variations || [];
      const hasVariation =
        variations.includes(variation) || variations.length === 0;

      if (hasVariation) {
        return { ...resolved, service: { ...resolved.service, variation } };
      }
    }
  }

  return null;
}

/** Paths that should never be treated as service slugs */
export const RESERVED_PATHS = new Set([
  'order',
  'track',
  'about',
  'contact',
  'login',
  'register',
  'signup',
  'dashboard',
  'services',
  'payment',
  'admin',
  'api',
  'learn',
  'blog',
  'guides',
  'tools',
  'pricing',
  'careers',
  'press',
  'partners',
  'customer-reviews',
  'terms',
  'privacy',
  'refund',
  'disclaimer',
  'onboarding',
  'free-consultation',
  'request-callback',
  'book-consultation',
  'start-now',
  'talk-to-expert',
  'get-quote',
  'request-demo',
]);

/** Valid subpage slugs for service detail pages */
export const VALID_SUBPAGES = new Set([
  'documents-required',
  'process',
  'eligibility',
  'fees',
  'timeline',
  'faq',
  'overview',
  'documents',
  'government-fees',
  'classification',
]);
