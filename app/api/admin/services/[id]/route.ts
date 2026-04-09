import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/jwt';
import { isValidObjectId } from '@/lib/validators';
import { sanitizeInput } from '@/lib/sanitize';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function parseAdditionalCharges(raw: unknown): { label: string; amount: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const label = sanitizeInput(String((row as { label?: unknown }).label || '').trim()).slice(
        0,
        200
      );
      const amount = Math.max(0, Number((row as { amount?: unknown }).amount) || 0);
      return { label: label || 'Additional charge', amount };
    })
    .filter((r) => r.amount > 0);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid service id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      name,
      price,
      gstPercent,
      governmentFee,
      professionalFee,
      serviceCharge,
      additionalCharges,
      useDatabasePricing,
      isActive,
    } = body as Record<string, unknown>;

    const $set: Record<string, unknown> = {};

    if (typeof name === 'string' && name.trim()) {
      $set.name = sanitizeInput(name.trim()).slice(0, 200);
    }
    if (price !== undefined) {
      $set.price = Math.max(0, Number(price) || 0);
    }
    if (gstPercent !== undefined) {
      $set.gstPercent = Math.min(100, Math.max(0, Number(gstPercent) || 0));
    }
    if (governmentFee !== undefined) {
      $set.governmentFee = Math.max(0, Number(governmentFee) || 0);
    }
    if (professionalFee !== undefined) {
      $set.professionalFee = Math.max(0, Number(professionalFee) || 0);
    }
    if (serviceCharge !== undefined) {
      $set.serviceCharge = Math.max(0, Number(serviceCharge) || 0);
    }
    if (additionalCharges !== undefined) {
      $set.additionalCharges = parseAdditionalCharges(additionalCharges);
    }
    if (typeof useDatabasePricing === 'boolean') {
      $set.useDatabasePricing = useDatabasePricing;
    }
    if (typeof isActive === 'boolean') {
      $set.isActive = isActive;
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const m = await connectDB();
    const db = m.connection?.db;
    if (!db) throw new Error('Database connection not ready');

    const _id = new mongoose.Types.ObjectId(id);
    const res = await db.collection('services').updateOne({ _id }, { $set });

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const updated = await db.collection('services').findOne({ _id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin service patch error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}
