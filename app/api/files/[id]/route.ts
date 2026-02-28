import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoredFile from '@/models/StoredFile';
import { isValidObjectId } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return new NextResponse('Not found', { status: 404 });
    }

    await connectDB();
    const file = await StoredFile.findById(id).lean();
    if (!file || !file.data) {
      return new NextResponse('Not found', { status: 404 });
    }

    const contentType = file.contentType || 'application/octet-stream';
    return new NextResponse(Buffer.from(file.data as unknown as ArrayBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('Error', { status: 500 });
  }
}
