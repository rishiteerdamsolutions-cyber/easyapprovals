import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signAdminToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await admin.comparePassword(password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signAdminToken({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    return NextResponse.json({
      token,
      admin: { email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
