import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(request);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const emailOrPhone = searchParams.get('emailOrPhone');

    if (!orderId || !emailOrPhone) {
      return NextResponse.json(
        { error: 'Order ID and Email or Phone required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      orderId: orderId.trim(),
      $or: [
        { customerEmail: { $regex: new RegExp(`^${emailOrPhone.trim()}$`, 'i') } },
        { customerPhone: emailOrPhone.trim() },
      ],
    })
      .select('orderId paymentStatus orderStatus totalAmount services createdAt')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
