import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid orderId or amount (min ₹1)' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: order.orderId,
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'pending',
      paymentReference: razorpayOrder.id,
    });

    return NextResponse.json({
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
