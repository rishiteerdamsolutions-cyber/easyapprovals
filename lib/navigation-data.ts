/**
 * Navigation data for mega menu and footer.
 * Single source of truth for site structure.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  id: string;
  label: string;
  href?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: 'start-business',
    label: 'Start a Business',
    href: '/services?category=startup',
    items: [
      { label: 'Proprietorship Registration', href: '/services/proprietorship-registration' },
      { label: 'Partnership Firm Registration', href: '/services/partnership-registration' },
      { label: 'LLP Registration', href: '/services/llp-registration' },
      { label: 'Private Limited Company', href: '/services/private-limited-company-registration' },
      { label: 'One Person Company (OPC)', href: '/services/opc-registration' },
      { label: 'Section 8 Company', href: '/services/section-8-company-registration' },
      { label: 'Producer Company', href: '/services/producer-company-registration' },
      { label: 'Indian Subsidiary', href: '/services/indian-subsidiary-registration' },
      { label: 'Startup India Registration', href: '/services/startup-india-registration' },
      { label: 'Trust Registration', href: '/services/trust-registration' },
      { label: 'Public Limited Company', href: '/services/public-limited-company-registration' },
    ],
  },
  {
    id: 'registrations',
    label: 'Registrations & Licenses',
    href: '/services?category=registrations',
    items: [
      { label: 'MSME / Udyam Registration', href: '/services/udyam-registration' },
      { label: 'Import Export Code (IEC)', href: '/services/import-export-code' },
      { label: 'FSSAI Registration', href: '/services/fssai-registration' },
      { label: 'FSSAI License', href: '/services/fssai-license' },
      { label: 'Shop Act Registration', href: '/services/shop-act-registration' },
      { label: 'Professional Tax Registration', href: '/services/professional-tax-registration' },
      { label: 'Trade License', href: '/services/trade-license' },
      { label: 'Digital Signature Certificate', href: '/services/digital-signature-certificate' },
      { label: 'TAN Registration', href: '/services/tan-registration' },
      { label: 'PF Registration', href: '/services/pf-registration' },
      { label: 'ESI Registration', href: '/services/esi-registration' },
      { label: 'ISO Certification', href: '/services/iso-registration' },
      { label: 'Legal Entity Identifier', href: '/services/legal-entity-identifier-code' },
    ],
  },
  {
    id: 'trademark',
    label: 'Trademark & IP',
    href: '/services?category=trademark',
    items: [
      { label: 'Trademark Registration', href: '/services/trademark-registration' },
      { label: 'Trademark Objection', href: '/services/trademark-objection' },
      { label: 'Trademark Opposition', href: '/services/trademark-opposition' },
      { label: 'Trademark Renewal', href: '/services/trademark-renewal' },
      { label: 'Copyright Registration', href: '/services/copyright-registration' },
      { label: 'Patent Registration', href: '/services/patent-registration' },
      { label: 'Design Registration', href: '/services/design-registration' },
      { label: 'Logo Designing', href: '/services/logo-designing' },
    ],
  },
  {
    id: 'gst',
    label: 'GST Services',
    href: '/services?category=gst',
    items: [
      { label: 'GST Registration', href: '/services/gst-registration' },
      { label: 'GST Return Filing', href: '/services/gst-return-filing' },
      { label: 'GST NIL Return', href: '/services/gst-nil-return-filing' },
      { label: 'GST Amendment', href: '/services/gst-amendment' },
      { label: 'GST Revocation', href: '/services/gst-revocation' },
      { label: 'GST LUT Form', href: '/services/gst-lut-form' },
      { label: 'GST Notice Handling', href: '/services/gst-notice-handling' },
      { label: 'GST Annual Return', href: '/services/gst-annual-return-filing' },
      { label: 'GST E-Invoicing', href: '/services/gst-einvoicing-software' },
      { label: 'Virtual Office + GSTIN', href: '/services/virtual-office-gstin' },
    ],
  },
  {
    id: 'income-tax',
    label: 'Income Tax',
    href: '/services?category=income-tax',
    items: [
      { label: 'Income Tax E-Filing', href: '/services/income-tax-filing' },
      { label: 'Business Tax Filing', href: '/services/business-tax-filing' },
      { label: 'Company ITR Filing', href: '/services/company-itr-filing' },
      { label: 'TDS Return Filing', href: '/services/tds-return-filing' },
      { label: 'Tax Notice Handling', href: '/services/income-tax-notice-handling' },
      { label: 'Revised ITR (ITR-U)', href: '/services/revised-itr-return' },
      { label: '15CA / 15CB Filing', href: '/services/15ca-15cb-filing' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/services?category=mca',
    items: [
      { label: 'Company Compliance', href: '/services/company-compliance' },
      { label: 'LLP Compliance', href: '/services/llp-compliance' },
      { label: 'OPC Compliance', href: '/services/opc-compliance' },
      { label: 'Director KYC (DIN eKYC)', href: '/services/din-ekyc-filing' },
      { label: 'Director Change', href: '/services/director-change' },
      { label: 'Name Change', href: '/services/name-change-company' },
      { label: 'Address Change', href: '/services/registered-office-change' },
      { label: 'Authorized Capital Increase', href: '/services/authorized-capital-increase' },
      { label: 'Share Transfer', href: '/services/share-transfer' },
      { label: 'Company Winding Up', href: '/services/winding-up-company' },
      { label: 'LLP Winding Up', href: '/services/winding-up-llp' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    href: '/services?category=compliance',
    items: [
      { label: 'Bookkeeping Services', href: '/services/bookkeeping-services' },
      { label: 'CA Support Services', href: '/services/ca-support-services' },
      { label: 'Business Plan Services', href: '/services/business-plan-services' },
      { label: 'Partnership Compliance', href: '/services/partnership-compliance' },
      { label: 'Proprietorship Compliance', href: '/services/proprietorship-compliance' },
    ],
  },
  {
    id: 'hr-payroll',
    label: 'HR & Payroll',
    href: '/services?category=compliance',
    items: [
      { label: 'HR & Payroll Processing', href: '/services/hr-payroll-processing' },
      { label: 'PF Return Filing', href: '/services/pf-return-filing' },
      { label: 'ESI Return Filing', href: '/services/esi-return-filing' },
      { label: 'Professional Tax Return', href: '/services/professional-tax-return-filing' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/learn',
    items: [
      { label: 'Learn', href: '/learn' },
      { label: 'Guides', href: '/guides' },
      { label: 'Blog', href: '/blog' },
    ],
  },
];

/** Footer column structure */
export const footerColumns = [
  {
    title: 'Start Business',
    links: [
      { label: 'Private Limited Company', href: '/services/private-limited-company-registration' },
      { label: 'LLP Registration', href: '/services/llp-registration' },
      { label: 'OPC Registration', href: '/services/opc-registration' },
      { label: 'Proprietorship', href: '/services/proprietorship-registration' },
      { label: 'Startup India', href: '/services/startup-india-registration' },
    ],
  },
  {
    title: 'Registrations',
    links: [
      { label: 'MSME / Udyam', href: '/services/udyam-registration' },
      { label: 'FSSAI', href: '/services/fssai-registration' },
      { label: 'IEC', href: '/services/import-export-code' },
      { label: 'DSC', href: '/services/digital-signature-certificate' },
      { label: 'TAN', href: '/services/tan-registration' },
    ],
  },
  {
    title: 'GST',
    links: [
      { label: 'GST Registration', href: '/services/gst-registration' },
      { label: 'GST Return Filing', href: '/services/gst-return-filing' },
      { label: 'GST Amendment', href: '/services/gst-amendment' },
      { label: 'GST LUT', href: '/services/gst-lut-form' },
    ],
  },
  {
    title: 'Trademark',
    links: [
      { label: 'Trademark Registration', href: '/services/trademark-registration' },
      { label: 'Trademark Objection', href: '/services/trademark-objection' },
      { label: 'Trademark Renewal', href: '/services/trademark-renewal' },
      { label: 'Copyright', href: '/services/copyright-registration' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Learn', href: '/learn' },
      { label: 'Guides', href: '/guides' },
      { label: 'Business Ideas', href: '/learn' },
      { label: 'Legal Guides', href: '/learn' },
      { label: 'Tax Guides', href: '/learn' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Reviews', href: '/customer-reviews' },
      { label: 'Partners', href: '/partners' },
    ],
  },
];

/** Bottom row links */
export const footerBottomLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Support', href: '/contact' },
];
