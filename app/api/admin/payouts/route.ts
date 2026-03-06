import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import CA from '@/models/CA';
import MonthlyExpenditure from '@/models/MonthlyExpenditure';
import { getAdminFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const COMPLETED_STATUSES = ['customer_verified', 'approved', 'completed'];

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);

    await connectDB();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const orders = await Order.find({
      paymentStatus: 'paid',
      orderStatus: { $in: COMPLETED_STATUSES },
      caMarkedCompleteAt: { $gte: start, $lte: end },
    })
      .populate('assignedCaId', 'name email')
      .lean();

    let totalProfessionalFee = 0;
    const caContributions: Record<string, { caId: string; name: string; email: string; fee: number }> = {};

    for (const order of orders) {
      const orderFee = (order.services || []).reduce(
        (sum: number, s: { professionalFee?: number }) => sum + (s.professionalFee || 0),
        0
      );
      totalProfessionalFee += orderFee;

      const caId = order.assignedCaId;
      if (caId) {
        const id = typeof caId === 'object' ? String(caId._id) : String(caId);
        const name = typeof caId === 'object' ? (caId as { name?: string }).name || 'Unknown' : 'Unknown';
        const email = typeof caId === 'object' ? (caId as { email?: string }).email || '' : '';
        if (!caContributions[id]) {
          caContributions[id] = { caId: id, name, email, fee: 0 };
        }
        caContributions[id].fee += orderFee;
      }
    }

    const platformShare = totalProfessionalFee * 0.5;
    const caPool = totalProfessionalFee * 0.5;

    const caPayouts = Object.values(caContributions).map((c) => ({
      ...c,
      share: totalProfessionalFee > 0 ? (c.fee / totalProfessionalFee) * caPool : 0,
    }));

    const expenditure = await MonthlyExpenditure.findOne({ year, month }).lean();
    const expenditureAmount = expenditure?.amount ?? 0;
    const platformNet = platformShare - expenditureAmount;

    return NextResponse.json({
      year,
      month,
      totalProfessionalFee,
      platformShare,
      caPool,
      expenditure: expenditureAmount,
      platformNet,
      caPayouts,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
