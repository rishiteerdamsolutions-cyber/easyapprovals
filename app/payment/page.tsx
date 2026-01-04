'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount') || '0';

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Mock payment processing - in real app, integrate with Razorpay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Store payment success in localStorage
      const paymentData = {
        orderId,
        amount: parseFloat(amount),
        status: 'success',
        transactionId: 'TXN' + Date.now(),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('lastPayment', JSON.stringify(paymentData));

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        router.push(`/payment/success?orderId=${orderId}`);
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your payment of ₹{parseFloat(amount).toLocaleString()} has been processed successfully.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Order ID</div>
            <div className="font-semibold text-gray-900">{orderId}</div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to order details...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
            <p className="opacity-90">Secure payment powered by Razorpay</p>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₹{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-primary-600">
                    ₹{parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-primary-500 rounded-lg cursor-pointer bg-primary-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    defaultChecked
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <div className="font-semibold">Razorpay</div>
                    <div className="text-sm text-gray-600">
                      Credit/Debit Cards, UPI, Net Banking, Wallets
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Secure Payment</p>
                <p>
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  Pay ₹{parseFloat(amount).toLocaleString()}
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              By proceeding, you agree to our Terms &amp; Conditions
            </p>
          </div>
        </div>

        {/* Note for Demo */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> This is a mock payment. Clicking &quot;Pay&quot; will show a success message.
            In production, this will integrate with Razorpay for real payments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

