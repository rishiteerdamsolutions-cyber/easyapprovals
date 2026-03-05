import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const tools = await Tool.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .populate('relatedServiceIds', 'name slug')
      .lean();

    return NextResponse.json(tools);
  } catch (error) {
    console.error('Tools API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
