import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Lead from '@/models/Lead';
import { getAdminFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const [totalOrders, paidOrders, pendingUploads, inReview, approved, revenueResult, totalLeads, unreadLeads] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ orderStatus: 'documents_pending', paymentStatus: 'paid' }),
      Order.countDocuments({ orderStatus: 'in_review' }),
      Order.countDocuments({ orderStatus: 'approved' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Lead.countDocuments(),
      Lead.countDocuments({ isRead: false }),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      totalOrders,
      paidOrders,
      pendingUploads,
      inReview,
      approved,
      revenue,
      totalLeads,
      unreadLeads,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
