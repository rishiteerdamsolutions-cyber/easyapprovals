import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    documentsEmail: process.env.DOCUMENTS_EMAIL || 'aideveloperindia@gmail.com',
  });
}
