import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  serviceCharge: number;
  governmentFee: number;
  professionalFee: number;
  gstPercent: number;
  price: number; // fallback total
  serviceId?: string;
}

export default function PricingSection({
  serviceCharge,
  governmentFee,
  professionalFee,
  gstPercent,
  price,
  serviceId,
}: PricingSectionProps) {
  const sc = serviceCharge ?? 0;
  const gf = governmentFee ?? 0;
  const pf = professionalFee ?? 0;
  const subtotal =
    sc > 0 || gf > 0 || pf > 0 ? sc + gf + pf : price;
  const isQuoteOnRequest = subtotal === 0 && price === 0;
  const gst = Math.round(subtotal * ((gstPercent ?? 18) / 100));
  const finalPrice = subtotal + gst;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Pricing</h2>
      <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">{isQuoteOnRequest ? '' : 'Starting from'}</div>
            <div className="text-4xl font-bold text-primary-600">
              {isQuoteOnRequest ? 'Quote on request' : `₹${finalPrice.toLocaleString()}`}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-200 pt-4 space-y-2">
          {sc > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge</span>
              <span className="font-semibold">₹{sc.toLocaleString()}</span>
            </div>
          )}
          {gf > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Government Fee</span>
              <span className="font-semibold">₹{gf.toLocaleString()}</span>
            </div>
          )}
          {pf > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Professional Fee</span>
              <span className="font-semibold">₹{pf.toLocaleString()}</span>
            </div>
          )}
          {sc === 0 && gf === 0 && pf === 0 && !isQuoteOnRequest && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
            </div>
          )}
          {!isQuoteOnRequest && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({(gstPercent ?? 18)}%)</span>
                <span className="font-semibold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary-200">
                <span>Total</span>
                <span className="text-primary-600">₹{finalPrice.toLocaleString()}</span>
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
