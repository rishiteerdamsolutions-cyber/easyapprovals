/**
 * Seed script: Populates Categories and Services from lib/services-data.
 * Loads MONGODB_URI from .env.local automatically.
 *
 * Run: npm run seed
 * Or:  npx tsx scripts/seed.ts
 */
import path from 'path';
import mongoose from 'mongoose';
import { services, serviceCategories } from '../lib/services-data';
import type { Service as StaticService } from '../lib/services-data';
import Category from '../models/Category';
import Service from '../models/Service';
import Admin from '../models/Admin';
import Article from '../models/Article';
import Tool from '../models/Tool';

// Load env: .env.local (Next.js) takes precedence, then .env
import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env.local') });
config();

type DocType = 'text' | 'email' | 'phone' | 'image' | 'pdf';

function mapDocToType(doc: string): DocType {
  const lower = doc.toLowerCase();
  if (lower.includes('photo') || lower.includes('aadhaar') || lower.includes('photograph'))
    return 'image';
  if (lower.includes('email')) return 'email';
  if (lower.includes('phone') || lower.includes('mobile')) return 'phone';
  return 'pdf';
}

function docNeedsCrop(doc: string): boolean {
  const lower = doc.toLowerCase();
  return lower.includes('aadhaar') || lower.includes('photo') || lower.includes('id');
}

function docsToRequiredDocuments(docs: string[]) {
  return docs.map((d) => ({
    fieldName: d.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    label: d,
    type: mapDocToType(d),
    verification: 'none' as const,
    cropRequired: docNeedsCrop(d),
    isMandatory: true,
    minResolutionWidth: docNeedsCrop(d) ? 800 : undefined,
    minFileSizeKB: 5120,
  }));
}

/** Default 4-step process for all services */
function defaultProcessSteps(serviceName: string) {
  return [
    { title: 'Submit Application', description: `Fill the form and submit required documents for ${serviceName}.` },
    { title: 'Document Verification', description: 'Our team verifies your documents and prepares the application.' },
    { title: 'Processing', description: 'We file the application with the relevant authority on your behalf.' },
    { title: 'Delivery', description: 'You receive the certificate or approval once processed.' },
  ];
}

/** Default FAQs for services */
function defaultFaqs(serviceName: string, processingTime: string) {
  return [
    {
      question: `How long does ${serviceName} take?`,
      answer: `Processing typically takes ${processingTime}. Timelines may vary based on authority workload.`,
    },
    {
      question: `What documents do I need for ${serviceName}?`,
      answer: 'Required documents are listed above. Our team will guide you through the exact checklist based on your case.',
    },
    {
      question: `Can I track my ${serviceName} application?`,
      answer: 'Yes. Once you place an order, you can track status via the Order Tracking page or your dashboard.',
    },
  ];
}

/** Services that support location-based SEO pages */
const LOCATION_ENABLED_SLUGS = new Set([
  'gst-registration',
  'private-limited-company-registration',
  'llp-registration',
  'proprietorship-registration',
  'fssai-registration',
  'trademark-registration',
  'udyam-registration',
  'import-export-code',
  'digital-signature-certificate',
  'income-tax-filing',
]);

/** Variation suffixes per service type (for Layer 2 SEO) */
function getVariationsForService(s: StaticService): string[] {
  const slug = s.slug;
  if (slug.includes('gst-registration'))
    return ['online', 'documents', 'fees', 'process', 'for-partnership', 'for-llp', 'for-proprietorship', 'cancellation'];
  if (slug.includes('trademark'))
    return ['search', 'classification', 'objection', 'renewal', 'assignment', 'documents', 'fees'];
  if (slug.includes('registration') && (slug.includes('company') || slug.includes('llp') || slug.includes('partnership')))
    return ['online', 'documents', 'process', 'fees', 'cost'];
  if (slug.includes('udyam') || slug.includes('msme'))
    return ['online', 'documents', 'process', 'fees'];
  return ['online', 'documents', 'process', 'fees'];
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required. Set it in .env.local or pass it when running.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  // Clear existing
  await Category.deleteMany({});
  await Service.deleteMany({});
  await Article.deleteMany({});
  await Tool.deleteMany({});
  console.log('Cleared existing categories, services, articles and tools.\n');

  // Seed categories
  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  const allCategories = [
    ...serviceCategories,
    { id: 'other', name: 'Any Other', icon: '📝' },
  ];
  for (const cat of allCategories) {
    const slug = cat.id;
    const c = await Category.create({
      name: cat.name,
      slug,
      description: `${cat.name} services`,
      isActive: true,
    });
    categoryMap[cat.id] = c._id;
  }
  console.log(`Created ${allCategories.length} categories.`);

  // Seed services with full schema
  let created = 0;
  let skipped = 0;
  for (const s of services) {
    const categoryId = categoryMap[s.category];
    if (!categoryId) {
      console.warn(`  Skipped ${s.name}: unknown category "${s.category}"`);
      skipped++;
      continue;
    }

    const serviceCharge = s.basePrice;
    const governmentFee = s.governmentFee ?? 0;
    const price = serviceCharge + governmentFee;
    const requiredDocuments = docsToRequiredDocuments(s.requiredDocuments);
    const processSteps = defaultProcessSteps(s.name);
    const faqs = defaultFaqs(s.name, s.processingTime);
    const benefits = s.benefits ?? [];
    const processingTime = s.processingTime ?? '';
    const variations = getVariationsForService(s);
    const locationsEnabled = LOCATION_ENABLED_SLUGS.has(s.slug);

    await Service.create({
      categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      price,
      serviceCharge,
      governmentFee,
      professionalFee: 0,
      gstPercent: 18,
      requiredDocuments,
      processSteps,
      eligibility: [],
      faqs,
      benefits,
      processingTime,
      aliases: [],
      variations,
      locationsEnabled,
      isActive: true,
    });
    created++;
  }

  // Add "Any Other" custom service
  const otherCatId = categoryMap['other'];
  if (otherCatId) {
    await Service.create({
      categoryId: otherCatId,
      name: 'Any Other',
      slug: 'any-other',
      description: 'Custom compliance service - describe your requirement',
      price: 0,
      serviceCharge: 0,
      governmentFee: 0,
      requiredDocuments: [
        {
          fieldName: 'custom_requirement',
          label: 'Describe your requirement',
          type: 'text',
          verification: 'none',
          cropRequired: false,
          isMandatory: true,
        },
      ],
      processSteps: [],
      eligibility: [],
      faqs: [],
      benefits: [],
      processingTime: 'Varies',
      aliases: [],
      variations: [],
      locationsEnabled: false,
      isActive: true,
    });
    created++;
  }

  console.log(`Created ${created} services (${skipped} skipped).\n`);

  // Seed articles (Knowledge Hub)
  const gstService = await Service.findOne({ slug: 'gst-registration' });
  const companyService = await Service.findOne({ slug: 'private-limited-company-registration' });
  const trademarkService = await Service.findOne({ slug: 'trademark-registration' });
  const gstId = gstService?._id;
  const companyId = companyService?._id;
  const trademarkId = trademarkService?._id;

  const sampleArticles: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    type: 'learn' | 'blog' | 'guide';
    tags: string[];
    relatedServiceIds: mongoose.Types.ObjectId[];
  }> = [
    {
      title: 'GST Registration: Complete Guide for Indian Businesses',
      slug: 'gst-registration-guide',
      excerpt: 'Everything you need to know about GST registration, eligibility, documents and process in India.',
      content: '<p>GST (Goods and Services Tax) registration is mandatory for businesses with turnover above ₹20 lakh (₹10 lakh in special category states). This guide covers eligibility, required documents, online application process, and common queries.</p><h2>Who needs GST registration?</h2><p>Any business exceeding the turnover threshold, e-commerce sellers, and businesses making inter-state supplies must register under GST.</p><h2>Documents required</h2><ul><li>PAN of the business</li><li>Aadhaar</li><li>Business proof (rent agreement, electricity bill)</li><li>Bank account details</li></ul>',
      type: 'learn',
      tags: ['GST', 'registration', 'tax'],
      relatedServiceIds: gstId ? [gstId] : [],
    },
    {
      title: 'Private Limited Company: Benefits and Registration Process',
      slug: 'private-limited-company-benefits',
      excerpt: 'Understand the advantages of a Private Limited Company and the step-by-step registration process.',
      content: '<p>A Private Limited Company offers limited liability, credibility, and easier access to funding. This guide explains the benefits, documents needed, and the online registration process through MCA.</p><h2>Key benefits</h2><ul><li>Limited liability protection</li><li>Separate legal entity</li><li>Easier to raise capital</li><li>Professional image</li></ul>',
      type: 'learn',
      tags: ['company', 'registration', 'startup'],
      relatedServiceIds: companyId ? [companyId] : [],
    },
    {
      title: 'GST Return Filing Due Dates 2024-25',
      slug: 'gst-return-due-dates-2024',
      excerpt: 'Monthly and annual GST return filing deadlines for FY 2024-25.',
      content: '<p>GSTR-1 (outward supplies) is due by the 11th of the next month. GSTR-3B (summary return) is due by the 20th. Annual return GSTR-9 is due by 31st December. Keep track of these dates to avoid late fees.</p>',
      type: 'blog',
      tags: ['GST', 'returns', 'compliance'],
      relatedServiceIds: gstId ? [gstId] : [],
    },
    {
      title: 'How to Register a Trademark in India',
      slug: 'trademark-registration-step-by-step',
      excerpt: 'Step-by-step guide to trademark registration including search, classification and filing.',
      content: '<p>Trademark registration protects your brand. Steps: (1) Conduct a trademark search (2) Choose the right class (3) File TM-A application (4) Examination and publication (5) Registration certificate. Processing typically takes 12-18 months.</p>',
      type: 'guide',
      tags: ['trademark', 'IP', 'registration'],
      relatedServiceIds: trademarkId ? [trademarkId] : [],
    },
    {
      title: 'MSME Udyam Registration: Eligibility and Benefits',
      slug: 'udyam-msme-registration-benefits',
      excerpt: 'MSME/Udyam registration benefits, eligibility criteria and how to register online.',
      content: '<p>Udyam registration is free and provides access to subsidies, collateral-free loans, and preference in government tenders. Micro enterprises: investment up to ₹1 crore, turnover up to ₹5 crore. Small: up to ₹10 crore investment, ₹50 crore turnover.</p>',
      type: 'guide',
      tags: ['MSME', 'Udyam', 'registration'],
      relatedServiceIds: [],
    },
  ];

  for (const a of sampleArticles) {
    await Article.create({
      ...a,
      isPublished: true,
      publishedAt: new Date(),
    });
  }
  console.log(`Created ${sampleArticles.length} articles.\n`);

  // Seed tools
  const tools = [
    {
      name: 'GST Calculator',
      slug: 'gst-calculator',
      description: 'Calculate GST amount, reverse GST, and inclusive/exclusive GST.',
      type: 'calculator' as const,
      icon: 'Calculator',
      relatedServiceIds: gstId ? [gstId] : [],
      sortOrder: 1,
    },
    {
      name: 'HSN Code Search',
      slug: 'hsn-code-search',
      description: 'Search HSN/SAC codes for GST return filing.',
      type: 'search' as const,
      icon: 'Search',
      relatedServiceIds: gstId ? [gstId] : [],
      sortOrder: 2,
    },
    {
      name: 'Company Name Availability',
      slug: 'company-name-availability',
      description: 'Check MCA name availability for company registration.',
      type: 'checker' as const,
      icon: 'CheckCircle',
      relatedServiceIds: companyId ? [companyId] : [],
      sortOrder: 3,
    },
  ];
  for (const t of tools) {
    await Tool.create({ ...t, isActive: true });
  }
  console.log(`Created ${tools.length} tools.\n`);

  // Create default admin if not exists
  const adminExists = await Admin.findOne({ email: 'admin@easyapproval.com' });
  if (!adminExists) {
    await Admin.create({
      email: 'admin@easyapproval.com',
      password: 'Admin@123',
      name: 'Admin',
    });
    console.log('Created default admin: admin@easyapproval.com / Admin@123');
  } else {
    console.log('Admin already exists.');
  }

  await mongoose.disconnect();
  console.log('\nSeed complete.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
