import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { applyExcelPricingToService } from '@/lib/excel-pricing';
import { isValidObjectId } from '@/lib/validators';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const m = await connectDB();
    const db = m.connection?.db;
    if (!db) throw new Error('Database connection not ready');

    const service = await db
      .collection('services')
      .findOne({ slug, isActive: true }, { projection: {} });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    let categoryObj: unknown = service.categoryId;
    const catIdStr = String(service.categoryId || '');
    if (isValidObjectId(catIdStr)) {
      const cat = await db
        .collection('categories')
        .findOne(
          { _id: new mongoose.Types.ObjectId(catIdStr) },
          { projection: { name: 1, slug: 1 } }
        );
      if (cat) categoryObj = { _id: cat._id, name: cat.name, slug: cat.slug };
    }

    return NextResponse.json(applyExcelPricingToService({ ...service, categoryId: categoryObj }));
  } catch (error) {
    console.error(
      'Service by slug API error:',
      error,
      error instanceof Error ? error.stack : undefined
    );
    const errMsg = error instanceof Error ? error.message : '';
    return NextResponse.json(
      { error: 'Failed to fetch service', details: errMsg ? errMsg.slice(0, 180) : undefined },
      { status: 500 }
    );
  }
}
