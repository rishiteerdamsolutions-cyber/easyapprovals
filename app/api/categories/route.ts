import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
