import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  getGstAmount,
  getSubtotalExcludingGst,
  type AdditionalChargeLine,
} from '@/lib/service-pricing-display';

interface PricingSectionProps {
  serviceCharge: number;
  governmentFee: number;
  professionalFee: number;
  gstPercent: number;
  price: number;
  additionalCharges?: AdditionalChargeLine[];
  serviceId?: string;
}

export default function PricingSection({
  serviceCharge,
  governmentFee,
  professionalFee,
  gstPercent,
  price,
  additionalCharges,
  serviceId,
}: PricingSectionProps) {
  const itemPrice = Number(price) || 0;
  const sc = Number(serviceCharge) || 0;
  const gf = Number(governmentFee) || 0;
  const pf = Number(professionalFee) || 0;
  const charges = additionalCharges ?? [];

  const subtotalExGst = getSubtotalExcludingGst({
    price: itemPrice,
    serviceCharge: sc,
    governmentFee: gf,
    professionalFee: pf,
    additionalCharges: charges,
  });

  const isQuoteOnRequest = subtotalExGst <= 0;
  const gst = getGstAmount(subtotalExGst, gstPercent);
  const finalPrice = subtotalExGst + gst;

  const showServiceChargeLine = sc > 0 && itemPrice === 0 && pf === 0;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Pricing</h2>
      <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">{isQuoteOnRequest ? '' : 'Starting from'}</div>
            <div className="text-4xl font-bold text-primary-600">
              {isQuoteOnRequest ? 'Quote on request' : `₹${finalPrice.toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-200 pt-4 space-y-2">
          {itemPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service / item price</span>
              <span className="font-semibold">₹{itemPrice.toLocaleString('en-IN')}</span>
            </div>
          )}
          {showServiceChargeLine && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service charge</span>
              <span className="font-semibold">₹{sc.toLocaleString('en-IN')}</span>
            </div>
          )}
          {gf > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Government fee</span>
              <span className="font-semibold">₹{gf.toLocaleString('en-IN')}</span>
            </div>
          )}
          {pf > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Professional fee</span>
              <span className="font-semibold">₹{pf.toLocaleString('en-IN')}</span>
            </div>
          )}
          {charges.map((c, i) =>
            (Number(c.amount) || 0) > 0 ? (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.label || 'Additional charge'}</span>
                <span className="font-semibold">
                  ₹{(Number(c.amount) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ) : null
          )}
          {itemPrice === 0 && !showServiceChargeLine && gf === 0 && pf === 0 && charges.length === 0 && !isQuoteOnRequest && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">₹{subtotalExGst.toLocaleString('en-IN')}</span>
            </div>
          )}
          {!isQuoteOnRequest && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal (excl. GST)</span>
                <span className="font-semibold">₹{subtotalExGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({gstPercent ?? 18}%)</span>
                <span className="font-semibold">₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary-200">
                <span>Total (incl. GST)</span>
                <span className="text-primary-600">₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}
        </div>
        <Link
          href={serviceId ? `/order?addService=${serviceId}` : '/order'}
          className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
