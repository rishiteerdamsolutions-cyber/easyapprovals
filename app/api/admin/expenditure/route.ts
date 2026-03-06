import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MonthlyExpenditure from '@/models/MonthlyExpenditure';
import { getAdminFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    await connectDB();

    const filter: Record<string, number> = {};
    if (year) filter.year = parseInt(year, 10);
    if (month) filter.month = parseInt(month, 10);

    const items = await MonthlyExpenditure.find(Object.keys(filter).length ? filter : {})
      .sort({ year: -1, month: -1 })
      .lean();

    return NextResponse.json(items);
  } catch (error) {
    console.error('Expenditure API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenditure' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { month, year, amount, notes } = body;

    if (!month || !year || amount === undefined) {
      return NextResponse.json(
        { error: 'Month, year and amount are required' },
        { status: 400 }
      );
    }

    const m = parseInt(String(month), 10);
    const y = parseInt(String(year), 10);
    const amt = parseFloat(String(amount));

    if (m < 1 || m > 12 || y < 2000 || y > 2100) {
      return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    await connectDB();

    const item = await MonthlyExpenditure.findOneAndUpdate(
      { year: y, month: m },
      { amount: amt, notes: notes || '' },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(item);
  } catch (error) {
    console.error('Expenditure create error:', error);
    return NextResponse.json(
      { error: 'Failed to save expenditure' },
      { status: 500 }
    );
  }
}
