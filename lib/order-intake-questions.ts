import { services } from '@/lib/services-data';

export type IntakeQuestion = { id: string; label: string };

/** slug -> category id from catalog (startup, registrations, …) */
const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.slug, s.category])
);

const STARTUP: IntakeQuestion[] = [
  { id: 'proposed_name', label: 'Proposed business or entity name (or “not decided yet”)' },
  { id: 'promoters', label: 'How many promoters / proposed directors or partners?' },
  { id: 'location', label: 'State and city for principal place of business' },
  { id: 'nri_foreign', label: 'Any NRI or foreign national among promoters? (Yes/No + brief)' },
  { id: 'capital', label: 'Approximate capital or investment you plan to start with' },
  { id: 'stage', label: 'Already operating a business or starting completely fresh?' },
];

const REGISTRATIONS: IntakeQuestion[] = [
  { id: 'jurisdiction', label: 'State / district where this license or registration applies' },
  { id: 'premises', label: 'Premises: owned, leased, home-based, or not yet finalised?' },
  { id: 'operational', label: 'Business already running or yet to commence?' },
  { id: 'scale', label: 'Approximate scale (turnover band, employees, or units — best estimate)' },
  { id: 'prior', label: 'Any prior application, rejection, or existing registration number?' },
  { id: 'timeline', label: 'Target timeline or urgency' },
];

const TRADEMARK: IntakeQuestion[] = [
  { id: 'mark', label: 'Exact word, logo, or device you want to protect' },
  { id: 'goods_services', label: 'Goods/services you will use the mark for (brief)' },
  { id: 'use_date', label: 'Already in use? If yes, since when; if not, proposed use' },
  { id: 'similar', label: 'Similar brands or marks you are aware of in your space' },
  { id: 'classes', label: 'Preferred Nice classes (if known) or state “need guidance”' },
  { id: 'history', label: 'Any earlier filing, objection, opposition, or hearing we should know about?' },
];

const GST: IntakeQuestion[] = [
  { id: 'scope', label: 'What do you need: new registration, amendment, returns, notice reply, or other?' },
  { id: 'state_place', label: 'State of principal place of business / operations' },
  { id: 'business_type', label: 'Business type: goods, services, or both; B2B/B2C if relevant' },
  { id: 'turnover', label: 'Approximate monthly or quarterly turnover (estimate is fine)' },
  { id: 'gstin', label: 'Existing GSTIN (if any), or “not registered yet”' },
  { id: 'notices', label: 'Any GST notice, suspension, or litigation pending?' },
];

const INCOME_TAX: IntakeQuestion[] = [
  { id: 'period', label: 'Assessment year or period you need help for' },
  { id: 'income_sources', label: 'Income sources (salary, business, capital gains, foreign, etc.)' },
  { id: 'filing_history', label: 'First-time filing, regular filing, or revising a prior return?' },
  { id: 'notices', label: 'Any income-tax notice, scrutiny, or demand?' },
  { id: 'documents', label: 'What documents do you already have (Form 16, books, bank statements)?' },
  { id: 'outcome', label: 'Desired outcome (e.g. minimise tax, refund, compliance only)' },
];

const MCA: IntakeQuestion[] = [
  { id: 'entity', label: 'Legal name of company/LLP and CIN/LLPIN (if known)' },
  { id: 'summary', label: 'One-line summary of what you need from us' },
  { id: 'resolutions', label: 'Board / partner resolution or approvals already in place? (Yes/No)' },
  { id: 'compliance', label: 'Any pending ROC/MCA compliance, defaults, or strike-off risk?' },
  { id: 'deadlines', label: 'Any statutory deadlines or bank/loan timelines we must meet?' },
  { id: 'documents_ready', label: 'Are scanned documents ready to share? (Yes/No + what is pending)' },
];

const COMPLIANCE: IntakeQuestion[] = [
  { id: 'entity_type', label: 'Entity type (proprietorship, partnership, company, LLP, trust, other)' },
  { id: 'size', label: 'Approximate turnover band and/or number of employees' },
  { id: 'books', label: 'How do you maintain books today (manual, Excel, Tally, other)?' },
  { id: 'period', label: 'Period to cover (e.g. monthly payroll, FY books, one-off project)' },
  { id: 'missed', label: 'Any statutory due dates already missed?' },
  { id: 'expectations', label: 'Deliverables you expect (reports, filings, CA certificate, etc.)' },
];

/** Custom / “Any Other” / quote-only catalogue items */
const QUOTE: IntakeQuestion[] = [
  { id: 'outcome', label: 'In one line: what outcome or deliverable do you expect?' },
  { id: 'sector', label: 'Industry or sector' },
  { id: 'location', label: 'State/city relevant to the work (if any)' },
  { id: 'prior_engagement', label: 'Already working with another CA or portal? (Yes/No + brief)' },
  { id: 'documents', label: 'What documents or references can you share upfront?' },
  { id: 'timeline', label: 'Preferred timeline' },
];

const CATEGORY_QUESTIONS: Record<string, IntakeQuestion[]> = {
  startup: STARTUP,
  registrations: REGISTRATIONS,
  trademark: TRADEMARK,
  gst: GST,
  'income-tax': INCOME_TAX,
  mca: MCA,
  compliance: COMPLIANCE,
};

/** Service-specific tweaks (optional); falls back to category */
const SLUG_OVERRIDES: Partial<Record<string, IntakeQuestion[]>> = {
  'private-limited-company-registration': [
    { id: 'name_approval', label: 'Desired company name(s) — in order of preference' },
    { id: 'directors', label: 'Number of directors; who will be MD/whole-time director?' },
    { id: 'subscribers', label: 'Shareholding pattern at incorporation (%, if decided)' },
    { id: 'registered_office', label: 'Registered office address status (final / temporary / to be arranged)' },
    { id: 'authorized_capital', label: 'Proposed authorised share capital (approx.)' },
    { id: 'other', label: 'Any subsidiary, holding, or foreign investment planned at incorporation?' },
  ],
  '15ca-15cb-filing': [
    { id: 'remittance', label: 'Nature and purpose of remittance; amount and currency' },
    { id: 'recipient', label: 'Recipient details (country, relationship to payer)' },
    { id: 'tax_treaty', label: 'Any tax treaty / DTAA angle relevant?' },
    { id: 'bank', label: 'Bank / AD bank involved; any LRS limits?' },
    { id: 'documents', label: 'Form 15CA draft or remittance letter available?' },
    { id: 'deadline', label: 'Payment / filing deadline' },
  ],
  'gst-registration': [
    { id: 'entity', label: 'Constitution (proprietorship, partnership, company, LLP, trust)' },
    { id: 'principal', label: 'Principal place of business — complete address' },
    { id: 'rent_own', label: 'Premises: own / rent / co-working / virtual office' },
    { id: 'turnover', label: 'Expected turnover in first year (estimate)' },
    { id: 'interstate', label: 'Will you supply across states or only within one state?' },
    { id: 'composition', label: 'Interested in composition scheme? (Yes/No / unsure)' },
  ],
  'trademark-registration': [
    { id: 'mark_type', label: 'Word mark, logo, or combined?' },
    { id: 'first_use', label: 'Date of first use in India (if any) or “proposed to be used”' },
    { id: 'applicant', label: 'Applicant will be individual, firm, or company? Name as per PAN' },
    { id: 'priority', label: 'Any convention priority or foreign application to claim from?' },
    { id: 'objection_risk', label: 'Known conflicting marks or similar businesses?' },
    { id: 'classes_detail', label: 'List goods/services in your own words (we can map to classes)' },
  ],
};

export function getIntakeQuestionsForSlug(serviceSlug: string): IntakeQuestion[] {
  if (!serviceSlug || serviceSlug === 'unknown') {
    return QUOTE;
  }
  if (serviceSlug === 'any-other') {
    return QUOTE;
  }
  const override = SLUG_OVERRIDES[serviceSlug];
  if (override) return override;

  const cat = SLUG_TO_CATEGORY[serviceSlug];
  if (cat && CATEGORY_QUESTIONS[cat]) {
    return CATEGORY_QUESTIONS[cat];
  }
  return QUOTE;
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
