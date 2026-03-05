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
  console.log('Cleared existing categories and services.\n');

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
