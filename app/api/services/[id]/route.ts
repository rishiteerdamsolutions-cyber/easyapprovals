import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    await connectDB();
    const service = await Service.findById(id)
      .populate('categoryId', 'name slug')
      .lean();

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
