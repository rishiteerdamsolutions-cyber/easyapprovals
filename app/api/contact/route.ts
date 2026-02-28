import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
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
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    const html = `
      <h2>Contact Form Submission</h2>
      <p><strong>From:</strong> ${sanitizeInput(name)}</p>
      <p><strong>Email:</strong> ${sanitizeInput(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${sanitizeInput(phone)}</p>` : ''}
      ${subject ? `<p><strong>Subject:</strong> ${sanitizeInput(subject)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${sanitizeInput(message).replace(/\n/g, '<br>')}</p>
    `;

    const adminEmail = process.env.CONTACT_EMAIL || 'admin@easyapproval.com';
    await sendEmail(adminEmail, `Contact: ${subject || 'New inquiry'}`, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
