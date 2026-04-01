/**
 * Legal / compliance copy shown on policy pages and for payment-gateway disclosures.
 * Set NEXT_PUBLIC_* values in production (see .env.example).
 */
export const SITE_LEGAL = {
  brandName: 'Easy Approval',
  legalEntityName:
    process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME?.trim() ||
    'India Easy Approvals LLP',
  registeredOffice:
    process.env.NEXT_PUBLIC_REGISTERED_OFFICE?.trim() ||
    '[Your full registered office address, India]',
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    'support@easyapproval.com',
  supportPhone:
    process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || '[Your support phone]',
  websiteUrl:
    process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.easyapproval.com',
  gstin: process.env.NEXT_PUBLIC_GSTIN?.trim() || '',
} as const;

/** Shown on all legal pages; update when policies are revised. */
export const POLICIES_EFFECTIVE_DATE = '1 April 2026';
