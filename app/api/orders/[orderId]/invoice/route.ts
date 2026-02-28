import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { isValidObjectId } from '@/lib/validators';
import { format } from 'date-fns';

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
      ? await Order.findById(id).lean()
      : await Order.findOne({ orderId: id }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = (order.services || []).map((s: { categoryName: string; serviceName: string; price: number; qty: number; total: number }) => ({
      categoryName: s.categoryName,
      serviceName: s.serviceName,
      qty: s.qty,
      amount: s.price,
      total: s.total,
    }));

    const pdfBytes = await generateInvoicePDF({
      orderId: order.orderId,
      date: format(new Date(order.createdAt), 'dd MMM yyyy'),
      items,
      grandTotal: order.totalAmount,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
