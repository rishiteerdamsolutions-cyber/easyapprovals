import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { getCaFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ca = getCaFromRequest(request);
  if (!ca) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      assignedCaId: ca.caId,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.orderStatus = 'ca_completed';
    order.caMarkedCompleteAt = new Date();
    await order.save();

    await OrderActivityLog.create({
      orderId: order._id,
      action: 'CA marked order complete',
      performedBy: ca.email,
    });

    return NextResponse.json(order.toObject());
  } catch (error) {
    console.error('CA complete order error:', error);
    return NextResponse.json(
      { error: 'Failed to complete order' },
      { status: 500 }
    );
  }
}
