import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      id,
      {
        customerVerified: true,
        orderStatus: 'customer_verified',
      },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await OrderActivityLog.create({
      orderId: order._id,
      action: 'Customer verified satisfied',
      performedBy: admin.email,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Verify customer error:', error);
    return NextResponse.json(
      { error: 'Failed to verify customer' },
      { status: 500 }
    );
  }
}
