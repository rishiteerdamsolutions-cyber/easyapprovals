import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    await connectDB();

    const orders = await Order.find({
      customerEmail: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders by email API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
