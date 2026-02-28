import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import UploadedDocument from '@/models/UploadedDocument';
import OrderActivityLog from '@/models/OrderActivityLog';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const id = params.orderId;
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await connectDB();

    const order = isValidObjectId(id)
      ? await Order.findById(id).populate('services.serviceId', 'name slug requiredDocuments').lean()
      : await Order.findOne({ orderId: id }).populate('services.serviceId', 'name slug requiredDocuments').lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderObjId = order._id as mongoose.Types.ObjectId;
    const documents = await UploadedDocument.find({ orderId: orderObjId }).lean();
    const logs = await OrderActivityLog.find({ orderId: orderObjId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({
      ...order,
      documents,
      activityLogs: logs,
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
