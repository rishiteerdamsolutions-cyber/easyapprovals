import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import CA from '@/models/CA';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

type OrderComplexity = 'low' | 'medium' | 'high';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { assignedToCa, assignedCaId, complexity } = body;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();

    const update: Record<string, unknown> = {};
    if (assignedCaId !== undefined) {
      update.assignedCaId = assignedCaId && isValidObjectId(assignedCaId) ? new mongoose.Types.ObjectId(assignedCaId) : null;
      const ca = assignedCaId ? await CA.findById(assignedCaId).lean() : null;
      update.assignedToCa = ca ? `${ca.name} (${ca.email})` : null;
      update.orderStatus = assignedCaId ? 'assigned' : 'in_review';
    } else if (assignedToCa !== undefined) {
      update.assignedToCa = assignedToCa?.trim() || null;
      update.assignedCaId = null;
    }
    if (complexity !== undefined && ['low', 'medium', 'high'].includes(complexity)) {
      update.complexity = complexity as OrderComplexity;
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true })
      .populate('assignedCaId', 'name email')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const caObj = order.assignedCaId as { name?: string } | null;
    const action =
      update.assignedCaId || update.assignedToCa
        ? `Assigned to CA: ${caObj?.name || assignedToCa || 'N/A'}${update.complexity ? ` (${update.complexity})` : ''}`
        : 'CA assignment cleared';

    await OrderActivityLog.create({
      orderId: order._id,
      action,
      performedBy: admin.email,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Assign CA error:', error);
    return NextResponse.json(
      { error: 'Failed to assign CA' },
      { status: 500 }
    );
  }
}
