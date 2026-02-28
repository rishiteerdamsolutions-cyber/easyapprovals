/**
 * Seed script: Populates Categories and Services from existing services-data.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
 * Or: MONGODB_URI=xxx node -r ts-node/register scripts/seed.ts
 */
import mongoose from 'mongoose';
import { services, serviceCategories } from '../lib/services-data';
import Category from '../models/Category';
import Service from '../models/Service';
import Admin from '../models/Admin';

type DocType = 'text' | 'email' | 'phone' | 'image' | 'pdf';

function mapDocToType(doc: string): DocType {
  const lower = doc.toLowerCase();
  if (lower.includes('photo') || lower.includes('aadhaar') || lower.includes('photograph')) return 'image';
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

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing
  await Category.deleteMany({});
  await Service.deleteMany({});
  console.log('Cleared existing categories and services');

  // Seed categories (include "Any Other" per spec)
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
  console.log(`Created ${allCategories.length} categories`);

  // Seed services
  for (const s of services) {
    const categoryId = categoryMap[s.category];
    if (!categoryId) {
      console.warn(`Unknown category: ${s.category} for service ${s.name}`);
      continue;
    }
    const price = s.basePrice + s.governmentFee;
    const requiredDocuments = docsToRequiredDocuments(s.requiredDocuments);
    await Service.create({
      categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      price,
      requiredDocuments,
      isActive: true,
    });
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
      isActive: true,
    });
  }
  console.log(`Created ${services.length + 1} services`);

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
    console.log('Admin already exists');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
