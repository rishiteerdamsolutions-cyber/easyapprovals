import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
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
    const { name, email, phone, subject, message, source, serviceSlug } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    const validSource = [
      'contact',
      'service_inquiry',
      'order_followup',
      'blog',
      'cart_intake',
      'other',
    ].includes(source)
      ? source
      : 'contact';

    await connectDB();
    await Lead.create({
      name: sanitizeInput(name.trim()),
      email: sanitizeInput(email.trim()),
      phone: phone?.trim() ? sanitizeInput(phone.trim()) : undefined,
      subject: subject?.trim() ? sanitizeInput(subject.trim()) : undefined,
      message: sanitizeInput(message.trim()),
      source: validSource,
      serviceSlug: serviceSlug?.trim() || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to save inquiry' },
      { status: 500 }
    );
  }
}
