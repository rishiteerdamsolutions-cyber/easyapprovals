import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const m = await connectDB();
    const db = m.connection?.db;
    if (!db) throw new Error('Database connection not ready');

    const services = await db
      .collection('services')
      .find({})
      .project({
        name: 1,
        slug: 1,
        price: 1,
        gstPercent: 1,
        governmentFee: 1,
        professionalFee: 1,
        serviceCharge: 1,
        additionalCharges: 1,
        useDatabasePricing: 1,
        categoryId: 1,
        isActive: 1,
      })
      .sort({ name: 1 })
      .toArray();

    const categoryIds = Array.from(
      new Set(services.map((s) => String(s.categoryId || '')).filter(Boolean))
    ).filter((id) => isValidObjectId(id));

    const cats =
      categoryIds.length > 0
        ? await db
            .collection('categories')
            .find({
              _id: {
                $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
              },
            })
            .project({ name: 1, slug: 1 })
            .toArray()
        : [];

    const catById = new Map(cats.map((c) => [String(c._id), c]));

    const payload = services.map((s) => ({
      ...s,
      categoryId: s.categoryId
        ? catById.get(String(s.categoryId)) ?? s.categoryId
        : s.categoryId,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Admin services list error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
