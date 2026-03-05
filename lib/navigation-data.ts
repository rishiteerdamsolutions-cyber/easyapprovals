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
      { label: 'Proprietorship Registration', href: '/proprietorship-registration' },
      { label: 'Partnership Firm Registration', href: '/partnership-registration' },
      { label: 'LLP Registration', href: '/llp-registration' },
      { label: 'Private Limited Company', href: '/private-limited-company-registration' },
      { label: 'One Person Company (OPC)', href: '/opc-registration' },
      { label: 'Section 8 Company', href: '/section-8-company-registration' },
      { label: 'Producer Company', href: '/producer-company-registration' },
      { label: 'Indian Subsidiary', href: '/indian-subsidiary-registration' },
      { label: 'Startup India Registration', href: '/startup-india-registration' },
      { label: 'Trust Registration', href: '/trust-registration' },
      { label: 'Public Limited Company', href: '/public-limited-company-registration' },
    ],
  },
  {
    id: 'registrations',
    label: 'Registrations & Licenses',
    href: '/services?category=registrations',
    items: [
      { label: 'MSME / Udyam Registration', href: '/udyam-registration' },
      { label: 'Import Export Code (IEC)', href: '/import-export-code' },
      { label: 'FSSAI Registration', href: '/fssai-registration' },
      { label: 'FSSAI License', href: '/fssai-license' },
      { label: 'Shop Act Registration', href: '/shop-act-registration' },
      { label: 'Professional Tax Registration', href: '/professional-tax-registration' },
      { label: 'Trade License', href: '/trade-license' },
      { label: 'Digital Signature Certificate', href: '/digital-signature-certificate' },
      { label: 'TAN Registration', href: '/tan-registration' },
      { label: 'PF Registration', href: '/pf-registration' },
      { label: 'ESI Registration', href: '/esi-registration' },
      { label: 'ISO Certification', href: '/iso-registration' },
      { label: 'Legal Entity Identifier', href: '/legal-entity-identifier-code' },
    ],
  },
  {
    id: 'trademark',
    label: 'Trademark & IP',
    href: '/services?category=trademark',
    items: [
      { label: 'Trademark Registration', href: '/trademark-registration' },
      { label: 'Trademark Objection', href: '/trademark-objection' },
      { label: 'Trademark Opposition', href: '/trademark-opposition' },
      { label: 'Trademark Renewal', href: '/trademark-renewal' },
      { label: 'Copyright Registration', href: '/copyright-registration' },
      { label: 'Patent Registration', href: '/patent-registration' },
      { label: 'Design Registration', href: '/design-registration' },
      { label: 'Logo Designing', href: '/logo-designing' },
    ],
  },
  {
    id: 'gst',
    label: 'GST Services',
    href: '/services?category=gst',
    items: [
      { label: 'GST Registration', href: '/gst-registration' },
      { label: 'GST Return Filing', href: '/gst-return-filing' },
      { label: 'GST NIL Return', href: '/gst-nil-return-filing' },
      { label: 'GST Amendment', href: '/gst-amendment' },
      { label: 'GST Revocation', href: '/gst-revocation' },
      { label: 'GST LUT Form', href: '/gst-lut-form' },
      { label: 'GST Notice Handling', href: '/gst-notice-handling' },
      { label: 'GST Annual Return', href: '/gst-annual-return-filing' },
      { label: 'GST E-Invoicing', href: '/gst-einvoicing-software' },
      { label: 'Virtual Office + GSTIN', href: '/virtual-office-gstin' },
    ],
  },
  {
    id: 'income-tax',
    label: 'Income Tax',
    href: '/services?category=income-tax',
    items: [
      { label: 'Income Tax E-Filing', href: '/income-tax-filing' },
      { label: 'Business Tax Filing', href: '/business-tax-filing' },
      { label: 'Company ITR Filing', href: '/company-itr-filing' },
      { label: 'TDS Return Filing', href: '/tds-return-filing' },
      { label: 'Tax Notice Handling', href: '/income-tax-notice-handling' },
      { label: 'Revised ITR (ITR-U)', href: '/revised-itr-return' },
      { label: '15CA / 15CB Filing', href: '/15ca-15cb-filing' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/services?category=mca',
    items: [
      { label: 'Company Compliance', href: '/company-compliance' },
      { label: 'LLP Compliance', href: '/llp-compliance' },
      { label: 'OPC Compliance', href: '/opc-compliance' },
      { label: 'Director KYC (DIN eKYC)', href: '/din-ekyc-filing' },
      { label: 'Director Change', href: '/director-change' },
      { label: 'Name Change', href: '/name-change-company' },
      { label: 'Address Change', href: '/registered-office-change' },
      { label: 'Authorized Capital Increase', href: '/authorized-capital-increase' },
      { label: 'Share Transfer', href: '/share-transfer' },
      { label: 'Company Winding Up', href: '/winding-up-company' },
      { label: 'LLP Winding Up', href: '/winding-up-llp' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    href: '/services?category=compliance',
    items: [
      { label: 'Bookkeeping Services', href: '/bookkeeping-services' },
      { label: 'CA Support Services', href: '/ca-support-services' },
      { label: 'Business Plan Services', href: '/business-plan-services' },
      { label: 'Partnership Compliance', href: '/partnership-compliance' },
      { label: 'Proprietorship Compliance', href: '/proprietorship-compliance' },
    ],
  },
  {
    id: 'hr-payroll',
    label: 'HR & Payroll',
    href: '/services?category=compliance',
    items: [
      { label: 'HR & Payroll Processing', href: '/hr-payroll-processing' },
      { label: 'PF Return Filing', href: '/pf-return-filing' },
      { label: 'ESI Return Filing', href: '/esi-return-filing' },
      { label: 'Professional Tax Return', href: '/professional-tax-return-filing' },
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
      { label: 'Private Limited Company', href: '/private-limited-company-registration' },
      { label: 'LLP Registration', href: '/llp-registration' },
      { label: 'OPC Registration', href: '/opc-registration' },
      { label: 'Proprietorship', href: '/proprietorship-registration' },
      { label: 'Startup India', href: '/startup-india-registration' },
    ],
  },
  {
    title: 'Registrations',
    links: [
      { label: 'MSME / Udyam', href: '/udyam-registration' },
      { label: 'FSSAI', href: '/fssai-registration' },
      { label: 'IEC', href: '/import-export-code' },
      { label: 'DSC', href: '/digital-signature-certificate' },
      { label: 'TAN', href: '/tan-registration' },
    ],
  },
  {
    title: 'GST',
    links: [
      { label: 'GST Registration', href: '/gst-registration' },
      { label: 'GST Return Filing', href: '/gst-return-filing' },
      { label: 'GST Amendment', href: '/gst-amendment' },
      { label: 'GST LUT', href: '/gst-lut-form' },
    ],
  },
  {
    title: 'Trademark',
    links: [
      { label: 'Trademark Registration', href: '/trademark-registration' },
      { label: 'Trademark Objection', href: '/trademark-objection' },
      { label: 'Trademark Renewal', href: '/trademark-renewal' },
      { label: 'Copyright', href: '/copyright-registration' },
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
