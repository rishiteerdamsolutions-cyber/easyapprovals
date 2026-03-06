import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { isValidObjectId } from '@/lib/validators';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    const items = (order.services || []).map((s: { categoryName?: string; serviceName?: string; price?: number; qty?: number; total?: number }) => ({
      categoryName: String(s.categoryName || ''),
      serviceName: String(s.serviceName || ''),
      qty: Number(s.qty) || 1,
      amount: Number(s.price) || 0,
      total: Number(s.total) || 0,
    }));

    const pdfBytes = await generateInvoicePDF({
      orderId: String(order.orderId || 'N/A'),
      date: order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy'),
      items: items.length > 0 ? items : [{ categoryName: 'Service', serviceName: 'Order', qty: 1, amount: order.totalAmount, total: order.totalAmount }],
      grandTotal: Number(order.totalAmount) || 0,
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
