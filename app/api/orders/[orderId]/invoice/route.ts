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

    if (order.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Invoice available after successful payment' }, { status: 403 });
    }

    const services = Array.isArray(order.services) ? order.services : [];
    const items = services.map((s: { categoryName?: string; serviceName?: string; price?: number; qty?: number; total?: number }) => ({
      categoryName: String(s?.categoryName ?? ''),
      serviceName: String(s?.serviceName ?? ''),
      qty: Number.isFinite(Number(s?.qty)) ? Number(s.qty) : 1,
      amount: Number.isFinite(Number(s?.price)) ? Number(s.price) : 0,
      total: Number.isFinite(Number(s?.total)) ? Number(s.total) : 0,
    }));

    const fallbackAmount = Number.isFinite(Number(order.totalAmount)) ? Number(order.totalAmount) : 0;
    const invoiceData = {
      orderId: String(order.orderId || 'N/A'),
      date: order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy'),
      items: items.length > 0 ? items : [{ categoryName: 'Service', serviceName: 'Order', qty: 1, amount: fallbackAmount, total: fallbackAmount }],
      grandTotal: fallbackAmount,
    };

    const pdfBytes = await generateInvoicePDF(invoiceData);
    const buffer = pdfBytes instanceof Uint8Array ? Buffer.from(pdfBytes) : Buffer.from(pdfBytes as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}.pdf"`,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Invoice error:', err.message, err.stack);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
