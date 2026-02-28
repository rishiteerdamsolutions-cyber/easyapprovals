import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UploadedDocument from '@/models/UploadedDocument';
import Order from '@/models/Order';
import OrderActivityLog from '@/models/OrderActivityLog';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';
import { sendEmail, documentRejectedEmail, orderApprovedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documentId, action, rejectionReason } = body;

    if (!documentId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid documentId or action' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    await connectDB();

    const doc = await UploadedDocument.findById(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (action === 'accept') {
      doc.qualityStatus = 'accepted';
      doc.rejectionReason = undefined;
      await doc.save();
    } else {
      doc.qualityStatus = 'rejected';
      doc.rejectionReason = rejectionReason || 'Document rejected';
      await doc.save();
      const order = await Order.findById(doc.orderId).lean();
      if (order) {
        await sendEmail(
          order.customerEmail,
          `Document Rejected - Order ${order.orderId}`,
          documentRejectedEmail(order.orderId, order.customerName, doc.fieldName, doc.rejectionReason || '')
        );
      }
    }

    await OrderActivityLog.create({
      orderId: doc.orderId,
      action: `Document ${action}ed: ${doc.fieldName}`,
      performedBy: 'admin',
    });

    const pendingCount = await UploadedDocument.countDocuments({
      orderId: doc.orderId,
      qualityStatus: 'pending',
    });
    const rejectedCount = await UploadedDocument.countDocuments({
      orderId: doc.orderId,
      qualityStatus: 'rejected',
    });

    if (pendingCount === 0 && rejectedCount === 0) {
      const order = await Order.findByIdAndUpdate(doc.orderId, { orderStatus: 'approved' }).lean();
      await OrderActivityLog.create({
        orderId: doc.orderId,
        action: 'All documents approved',
        performedBy: 'admin',
      });
      if (order) {
        const serviceNames = (order.services || []).map((s: { serviceName: string }) => s.serviceName);
        await sendEmail(
          order.customerEmail,
          `Order Approved - ${order.orderId}`,
          orderApprovedEmail(order.orderId, order.customerName, serviceNames)
        );
      }
    } else if (rejectedCount > 0) {
      await Order.findByIdAndUpdate(doc.orderId, { orderStatus: 'in_review' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document review error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
