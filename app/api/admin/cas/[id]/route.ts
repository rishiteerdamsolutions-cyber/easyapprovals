import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CA from '@/models/CA';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function generateLoginCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid CA ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, csoScore, notes, generateLogin } = body;

    await connectDB();

    const update: Record<string, unknown> = {};
    if (status !== undefined) update.status = status;
    if (csoScore !== undefined) update.csoScore = Math.min(100, Math.max(0, Number(csoScore)));
    if (notes !== undefined) update.notes = notes;

    if (status === 'admitted') {
      update.admittedAt = new Date();
    }

    if (generateLogin === true) {
      let code = generateLoginCode();
      let exists = await CA.findOne({ generatedLogin: code });
      while (exists) {
        code = generateLoginCode();
        exists = await CA.findOne({ generatedLogin: code });
      }
      update.generatedLogin = code;
    }

    const ca = await CA.findByIdAndUpdate(id, update, { new: true }).lean();

    if (!ca) {
      return NextResponse.json({ error: 'CA not found' }, { status: 404 });
    }

    return NextResponse.json(ca);
  } catch (error) {
    console.error('Admin CA update error:', error);
    return NextResponse.json(
      { error: 'Failed to update CA' },
      { status: 500 }
    );
  }
}
