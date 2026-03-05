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
