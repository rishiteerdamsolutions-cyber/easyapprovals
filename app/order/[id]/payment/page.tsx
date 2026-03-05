'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Loader2, CreditCard } from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function waitForRazorpay(maxMs = 10000): Promise<typeof window.Razorpay> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const start = Date.now();
    const check = () => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(window.Razorpay!);
        return;
      }
      if (Date.now() - start > maxMs) {
        resolve(undefined as unknown as typeof window.Razorpay);
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
}

interface RazorpayInstance {
  open: () => void;
  on?: (event: string, handler: () => void) => void;
}

interface OrderData {
  _id: string;
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
        if (data.paymentStatus === 'paid') {
          router.push(`/order/${id}/documents`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, router]);

  const handlePayment = async () => {
    if (!order || order.paymentStatus === 'paid') return;
    setProcessing(true);
    try {
      const res = await fetch('/api/orders/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, amount: order.totalAmount * 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment');

      const RazorpayConstructor = await waitForRazorpay();
      if (!RazorpayConstructor) {
        alert('Payment gateway is still loading. Please wait a moment and try again.');
        setProcessing(false);
        return;
      }

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Easy Approval',
        order_id: data.razorpayOrderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature?: string }) => {
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature || '',
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            router.push(`/order/${id}/documents`);
          } else {
            alert(verifyData.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone,
        },
      };

      const razorpay = new RazorpayConstructor(options);
      razorpay.on?.('payment.failed', () => {
        alert('Payment failed');
        setProcessing(false);
      });
      razorpay.open();
    } catch (e) {
      alert((e as Error).message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>
          <div className="space-y-4 mb-6">
            <p className="text-gray-600">Order ID: <span className="font-semibold">{order.orderId}</span></p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={processing || order.paymentStatus === 'paid' || !razorpayReady}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {!razorpayReady ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading payment gateway...
              </>
            ) : processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Opening Razorpay...
              </>
            ) : order.paymentStatus === 'paid' ? (
              'Payment Complete'
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay with Razorpay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
