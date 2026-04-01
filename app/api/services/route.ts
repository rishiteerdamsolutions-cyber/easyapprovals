import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { isValidObjectId } from '@/lib/validators';
import { applyExcelPricingToService } from '@/lib/excel-pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const filter: Record<string, unknown> = { isActive: true };
    if (categoryId && isValidObjectId(categoryId)) {
      filter.categoryId = categoryId;
    }

    // List view only needs summary fields — full documents were ~200KB+ and could
    // time out or fail to parse on slow clients.
    const services = await Service.find(filter)
      .select(
        'name slug description price serviceCharge governmentFee professionalFee gstPercent categoryId'
      )
      .populate('categoryId', 'name slug')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      services.map((service) => applyExcelPricingToService(service))
    );
  } catch (error) {
    console.error('Services API error:', error);
    const errMsg = error instanceof Error ? error.message : '';
    let message = 'Failed to fetch services';
    if (errMsg.includes('MONGODB_URI')) {
      message =
        'Database is not configured. Add MONGODB_URI to the server environment.';
    } else if (
      /ENOTFOUND|ECONNREFUSED|querySrv|MongoNetworkError|SSL|TLS|timed out/i.test(
        errMsg
      )
    ) {
      message =
        'Could not reach the database. Verify MONGODB_URI and Atlas Network Access (e.g. 0.0.0.0/0).';
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
