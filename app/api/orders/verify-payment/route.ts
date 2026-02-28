import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { isValidObjectId } from '@/lib/validators';
import { sendEmail, paymentSuccessEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, signature } = body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    if (signature) {
      if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, signature, keySecret)) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    } else {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: keySecret });
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      orderStatus: 'documents_pending',
      paymentReference: razorpay_payment_id,
    });

    await OrderActivityLog.create({
      orderId: order._id,
      action: `Payment successful: ${razorpay_payment_id}`,
      performedBy: 'system',
    });

    const serviceNames = (order.services || []).map((s: { serviceName: string }) => s.serviceName);
    await sendEmail(
      order.customerEmail,
      `Payment Successful - Order ${order.orderId}`,
      paymentSuccessEmail(order.orderId, order.customerName, order.totalAmount, serviceNames)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
