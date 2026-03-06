import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CA from '@/models/CA';
import { sanitizeInput } from '@/lib/sanitize';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { ok } = rateLimit(request);
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const emailStr = sanitizeInput(email.trim()).toLowerCase();

    await connectDB();

    const existing = await CA.findOne({ email: emailStr });
    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed. We will reach out to you shortly.' },
        { status: 400 }
      );
    }

    await CA.create({
      name: sanitizeInput(name.trim()),
      email: emailStr,
      phone: phone?.trim() ? sanitizeInput(phone.trim()) : undefined,
      status: 'subscribed',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CA subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
