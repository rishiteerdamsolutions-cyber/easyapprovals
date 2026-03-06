import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CA from '@/models/CA';
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

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const cas = await CA.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(cas);
  } catch (error) {
    console.error('Admin CAs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CAs' },
      { status: 500 }
    );
  }
}
