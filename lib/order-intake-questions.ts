import { services } from '@/lib/services-data';
import startup from '@/lib/data/intake/startup.json';
import registrations from '@/lib/data/intake/registrations.json';
import trademark from '@/lib/data/intake/trademark.json';
import gst from '@/lib/data/intake/gst.json';
import incomeTax from '@/lib/data/intake/income-tax.json';
import mca from '@/lib/data/intake/mca.json';
import compliance from '@/lib/data/intake/compliance.json';
import quote from '@/lib/data/intake/quote.json';

export type IntakeQuestion = { id: string; label: string };

/** slug -> category id from catalog (startup, registrations, …) */
const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.slug, s.category])
);

/** Per-service CA intake questions (catalog + quote slugs). */
const INTAKE_QUESTIONS_BY_SLUG: Record<string, IntakeQuestion[]> = {
  ...(startup as Record<string, IntakeQuestion[]>),
  ...(registrations as Record<string, IntakeQuestion[]>),
  ...(trademark as Record<string, IntakeQuestion[]>),
  ...(gst as Record<string, IntakeQuestion[]>),
  ...(incomeTax as Record<string, IntakeQuestion[]>),
  ...(mca as Record<string, IntakeQuestion[]>),
  ...(compliance as Record<string, IntakeQuestion[]>),
  ...(quote as Record<string, IntakeQuestion[]>),
};

/** Legacy category fallbacks if a slug is missing from JSON (new services). */
const CATEGORY_FALLBACK: Record<string, IntakeQuestion[]> = {
  startup: [
    { id: 'proposed_name', label: 'Proposed business or entity name (or “not decided yet”)' },
    { id: 'promoters', label: 'How many promoters / proposed directors or partners?' },
    { id: 'location', label: 'State and city for principal place of business' },
    { id: 'nri_foreign', label: 'Any NRI or foreign national among promoters? (Yes/No + brief)' },
    { id: 'capital', label: 'Approximate capital or investment you plan to start with' },
    { id: 'stage', label: 'Already operating a business or starting completely fresh?' },
  ],
  registrations: [
    { id: 'jurisdiction', label: 'State / district where this license or registration applies' },
    { id: 'premises', label: 'Premises: owned, leased, home-based, or not yet finalised?' },
    { id: 'operational', label: 'Business already running or yet to commence?' },
    { id: 'scale', label: 'Approximate scale (turnover band, employees, or units — best estimate)' },
    { id: 'prior', label: 'Any prior application, rejection, or existing registration number?' },
    { id: 'timeline', label: 'Target timeline or urgency' },
  ],
  trademark: [
    { id: 'mark', label: 'Exact word, logo, or device you want to protect' },
    { id: 'goods_services', label: 'Goods/services you will use the mark for (brief)' },
    { id: 'use_date', label: 'Already in use? If yes, since when; if not, proposed use' },
    { id: 'similar', label: 'Similar brands or marks you are aware of in your space' },
    { id: 'classes', label: 'Preferred Nice classes (if known) or state “need guidance”' },
    { id: 'history', label: 'Any earlier filing, objection, opposition, or hearing we should know about?' },
  ],
  gst: [
    { id: 'scope', label: 'What do you need: new registration, amendment, returns, notice reply, or other?' },
    { id: 'state_place', label: 'State of principal place of business / operations' },
    { id: 'business_type', label: 'Business type: goods, services, or both; B2B/B2C if relevant' },
    { id: 'turnover', label: 'Approximate monthly or quarterly turnover (estimate is fine)' },
    { id: 'gstin', label: 'Existing GSTIN (if any), or “not registered yet”' },
    { id: 'notices', label: 'Any GST notice, suspension, or litigation pending?' },
  ],
  'income-tax': [
    { id: 'period', label: 'Assessment year or period you need help for' },
    { id: 'income_sources', label: 'Income sources (salary, business, capital gains, foreign, etc.)' },
    { id: 'filing_history', label: 'First-time filing, regular filing, or revising a prior return?' },
    { id: 'notices', label: 'Any income-tax notice, scrutiny, or demand?' },
    { id: 'documents', label: 'What documents do you already have (Form 16, books, bank statements)?' },
    { id: 'outcome', label: 'Desired outcome (e.g. minimise tax, refund, compliance only)' },
  ],
  mca: [
    { id: 'entity', label: 'Legal name of company/LLP and CIN/LLPIN (if known)' },
    { id: 'summary', label: 'One-line summary of what you need from us' },
    { id: 'resolutions', label: 'Board / partner resolution or approvals already in place? (Yes/No)' },
    { id: 'compliance', label: 'Any pending ROC/MCA compliance, defaults, or strike-off risk?' },
    { id: 'deadlines', label: 'Any statutory deadlines or bank/loan timelines we must meet?' },
    { id: 'documents_ready', label: 'Are scanned documents ready to share? (Yes/No + what is pending)' },
  ],
  compliance: [
    { id: 'entity_type', label: 'Entity type (proprietorship, partnership, company, LLP, trust, other)' },
    { id: 'size', label: 'Approximate turnover band and/or number of employees' },
    { id: 'books', label: 'How do you maintain books today (manual, Excel, Tally, other)?' },
    { id: 'period', label: 'Period to cover (e.g. monthly payroll, FY books, one-off project)' },
    { id: 'missed', label: 'Any statutory due dates already missed?' },
    { id: 'expectations', label: 'Deliverables you expect (reports, filings, CA certificate, etc.)' },
  ],
};

const quoteMap = quote as Record<string, IntakeQuestion[]>;
const QUOTE_FALLBACK: IntakeQuestion[] =
  quoteMap.unknown ||
  quoteMap['any-other'] || [
    { id: 'outcome', label: 'In one line: what outcome or deliverable do you expect?' },
    { id: 'sector', label: 'Industry or sector' },
    { id: 'location', label: 'State/city relevant to the work (if any)' },
    { id: 'prior_engagement', label: 'Already working with another CA or portal? (Yes/No + brief)' },
    { id: 'documents', label: 'What documents or references can you share upfront?' },
    { id: 'timeline', label: 'Preferred timeline' },
  ];

export function getIntakeQuestionsForSlug(serviceSlug: string): IntakeQuestion[] {
  const slug = (serviceSlug || '').trim();
  if (!slug || slug === 'unknown') {
    return INTAKE_QUESTIONS_BY_SLUG.unknown ?? QUOTE_FALLBACK;
  }
  if (slug === 'any-other') {
    return INTAKE_QUESTIONS_BY_SLUG['any-other'] ?? QUOTE_FALLBACK;
  }
  const direct = INTAKE_QUESTIONS_BY_SLUG[slug];
  if (direct && direct.length > 0) return direct;

  const cat = SLUG_TO_CATEGORY[slug];
  if (cat && CATEGORY_FALLBACK[cat]) return CATEGORY_FALLBACK[cat];

  return INTAKE_QUESTIONS_BY_SLUG.unknown ?? QUOTE_FALLBACK;
}

export function areIntakeQuestionsAnswered(
  serviceSlug: string,
  answers: Record<string, string>
): boolean {
  const qs = getIntakeQuestionsForSlug(serviceSlug);
  return qs.every((q) => (answers[q.id] || '').trim().length > 0);
}

export function isIntakeCompleteForItem(
  serviceSlug: string,
  answers: Record<string, string>,
  customerNote: string
): boolean {
  return (
    areIntakeQuestionsAnswered(serviceSlug, answers) &&
    (customerNote || '').trim().length > 0
  );
}
