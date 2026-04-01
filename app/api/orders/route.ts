import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { generateOrderId } from '@/lib/order-utils';
import { sanitizeInput } from '@/lib/sanitize';
import { isValidObjectId } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { ok } = rateLimit(request);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, services: orderServices } = body;

    if (!customerName || !customerEmail || !customerPhone || !orderServices?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, customerPhone, services' },
        { status: 400 }
      );
    }

    const totalAmount = orderServices.reduce(
      (sum: number, s: { total: number }) => sum + (s.total || 0),
      0
    );

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const orderId = generateOrderId();

    await connectDB();

    const order = await Order.create({
      orderId,
      customerName: sanitizeInput(customerName),
      customerEmail: sanitizeInput(customerEmail),
      customerPhone: sanitizeInput(customerPhone),
      services: orderServices.map(
        (s: {
          serviceId: string;
          serviceName: string;
          categoryName: string;
          price: number;
          qty: number;
          total: number;
          professionalFee?: number;
          intakeAnswers?: { questionId: string; question: string; answer: string }[];
          intakeCustomerNote?: string;
        }) => ({
          serviceId: isValidObjectId(s.serviceId) ? s.serviceId : null,
          serviceName: sanitizeInput(s.serviceName),
          categoryName: sanitizeInput(s.categoryName),
          price: Number(s.price),
          qty: Number(s.qty) || 1,
          total: Number(s.total),
          professionalFee: Number(s.professionalFee) || 0,
          intakeAnswers: Array.isArray(s.intakeAnswers)
            ? s.intakeAnswers.map((a) => ({
                questionId: sanitizeInput(String(a.questionId || '')),
                question: sanitizeInput(String(a.question || '')),
                answer: sanitizeInput(String(a.answer || '')),
              }))
            : undefined,
          intakeCustomerNote: s.intakeCustomerNote
            ? sanitizeInput(String(s.intakeCustomerNote))
            : undefined,
        })
      ),
      totalAmount,
      paymentStatus: 'created',
      orderStatus: 'payment_pending',
    });

    await OrderActivityLog.create({
      orderId: order._id,
      action: 'Order created',
      performedBy: 'system',
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await Order.findByIdAndUpdate(order._id, {
      invoiceUrl: `${baseUrl}/api/orders/${order._id}/invoice`,
    });

    return NextResponse.json({
      orderId: order.orderId,
      _id: order._id.toString(),
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
