import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CA from '@/models/CA';
import { signCaToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, loginCode } = body;

    if (!email?.trim() || !loginCode?.trim()) {
      return NextResponse.json(
        { error: 'Email and login code are required' },
        { status: 400 }
      );
    }

    const code = String(loginCode).trim().toUpperCase();

    await connectDB();

    const ca = await CA.findOne({
      email: String(email).trim().toLowerCase(),
      status: 'admitted',
      generatedLogin: code,
    }).lean();

    if (!ca) {
      return NextResponse.json(
        { error: 'Invalid email or login code' },
        { status: 401 }
      );
    }

    const token = signCaToken({
      caId: String(ca._id),
      email: ca.email,
    });

    return NextResponse.json({
      token,
      ca: { _id: ca._id, name: ca.name, email: ca.email },
    });
  } catch (error) {
    console.error('CA verify-login error:', error);
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    );
  }
}
