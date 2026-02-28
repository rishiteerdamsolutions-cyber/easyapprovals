import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const filter: Record<string, unknown> = { isActive: true };
    if (categoryId && isValidObjectId(categoryId)) {
      filter.categoryId = categoryId;
    }

    const services = await Service.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(services);
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
