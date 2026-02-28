import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const signature = request.headers.get('x-razorpay-signature') || '';
    const body = await request.text();

    if (!verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    if (payload.event !== 'payment.captured') {
      return NextResponse.json({ received: true });
    }

    const payment = payload.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ received: true });

    const orderId = payment.order_id;
    const paymentId = payment.id;

    await connectDB();

    const order = await Order.findOne({ paymentReference: orderId });
    if (!order) {
      const orderByReceipt = await Order.findOne({ orderId: payload.payload?.order?.entity?.receipt });
      if (orderByReceipt) {
        await Order.findByIdAndUpdate(orderByReceipt._id, {
          paymentStatus: 'paid',
          orderStatus: 'documents_pending',
          paymentReference: paymentId,
        });
        await OrderActivityLog.create({
          orderId: orderByReceipt._id,
          action: `Payment captured via webhook: ${paymentId}`,
          performedBy: 'system',
        });
      }
      return NextResponse.json({ received: true });
    }

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      orderStatus: 'documents_pending',
      paymentReference: paymentId,
    });

    await OrderActivityLog.create({
      orderId: order._id,
      action: `Payment captured via webhook: ${paymentId}`,
      performedBy: 'system',
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
