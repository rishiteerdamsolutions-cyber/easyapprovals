import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UploadedDocument from '@/models/UploadedDocument';
import StoredFile from '@/models/StoredFile';
import OrderActivityLog from '@/models/OrderActivityLog';
import Order from '@/models/Order';
import Service from '@/models/Service';
import { validateFileType, validateFileSize } from '@/lib/validators';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

async function storeFile(
  buffer: Buffer,
  mime: string,
  orderId: string,
  serviceId: string,
  fieldName: string
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const stored = await StoredFile.findOneAndUpdate(
    { orderId, serviceId, fieldName },
    { orderId, serviceId, fieldName, contentType: mime, data: buffer },
    { upsert: true, new: true }
  );
  return `${baseUrl}/api/files/${stored._id}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderId = formData.get('orderId') as string;
    const serviceId = formData.get('serviceId') as string;
    const fieldName = formData.get('fieldName') as string;

    if (!file || !orderId || !serviceId || !fieldName) {
      return NextResponse.json(
        { error: 'Missing file, orderId, serviceId or fieldName' },
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const mime = file.type;
    if (!validateFileType(mime)) {
      return NextResponse.json(
        { error: 'Allowed types: jpg, png, pdf' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(orderId) || !isValidObjectId(serviceId)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await storeFile(buffer, mime, orderId, serviceId, fieldName);

    await UploadedDocument.findOneAndUpdate(
      { orderId, serviceId, fieldName },
      {
        orderId,
        serviceId,
        fieldName,
        fileUrl,
        qualityStatus: 'pending',
        rejectionReason: undefined,
      },
      { upsert: true, new: true }
    );

    let totalRequired = 0;
    for (const s of order.services || []) {
      const svc = await Service.findById(s.serviceId);
      totalRequired += svc?.requiredDocuments?.length || 0;
    }

    const uploadedCount = await UploadedDocument.countDocuments({
      orderId,
      qualityStatus: { $in: ['pending', 'accepted'] },
    });

    if (totalRequired > 0 && uploadedCount >= totalRequired) {
      await Order.findByIdAndUpdate(orderId, {
        orderStatus: 'documents_uploaded',
      });
    }

    await OrderActivityLog.create({
      orderId,
      action: `Document uploaded: ${fieldName}`,
      performedBy: 'user',
    });

    return NextResponse.json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
