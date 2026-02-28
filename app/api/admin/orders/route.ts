import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAdminFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = {};
    if (status) filter.orderStatus = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, Date>).$lte = new Date(to + 'T23:59:59.999Z');
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
