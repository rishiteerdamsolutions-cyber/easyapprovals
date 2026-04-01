import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { isValidObjectId } from '@/lib/validators';
import { applyExcelPricingToService } from '@/lib/excel-pricing';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
/** Cold MongoDB connections on Vercel can exceed the default 10s on Hobby. */
export const maxDuration = 30;

function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function GET(request: NextRequest) {
  try {
    const m = await connectDB();
    const db = m.connection?.db;
    if (!db) throw new Error('Database connection not ready');
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const filter: Record<string, unknown> = { isActive: true };
    if (categoryId && isValidObjectId(categoryId)) {
      filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    // List view only needs summary fields — full documents were ~200KB+ and could
    // time out or fail to parse on slow clients.
    const services = await db
      .collection('services')
      .find(filter)
      .project({
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        serviceCharge: 1,
        governmentFee: 1,
        professionalFee: 1,
        gstPercent: 1,
        categoryId: 1,
        isActive: 1,
      })
      .toArray();

    // Lightweight populate for category (avoids Mongoose populate issues/timeouts).
    const categoryIds = Array.from(
      new Set(services.map((s) => String(s.categoryId || '')).filter(Boolean))
    ).filter((id) => isValidObjectId(id));

    const categories =
      categoryIds.length > 0
        ? await db
            .collection('categories')
            .find({ _id: { $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)) } })
            .project({ name: 1, slug: 1 })
            .toArray()
        : [];

    const categoryById = new Map(
      categories.map((c) => [String(c._id), { _id: c._id, name: c.name, slug: c.slug }])
    );

    const payload = services.map((service) => {
      try {
        const cat = service.categoryId ? categoryById.get(String(service.categoryId)) : undefined;
        const shaped = {
          ...service,
          categoryId: cat ?? service.categoryId,
        };
        return toJsonSafe(applyExcelPricingToService(shaped));
      } catch (rowErr) {
        console.error('Services row map error:', rowErr, service?.slug);
        return toJsonSafe(service);
      }
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      'Services API error:',
      error,
      error instanceof Error ? error.stack : undefined
    );
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
    return NextResponse.json(
      { error: message, details: errMsg ? errMsg.slice(0, 180) : undefined },
      { status: 500 }
    );
  }
}
