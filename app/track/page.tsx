'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [order, setOrder] = useState<{
    orderId: string;
    paymentStatus: string;
    orderStatus: string;
    totalAmount: number;
    services: { serviceName: string; categoryName: string }[];
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !emailOrPhone.trim()) {
      setError('Enter Order ID and Email or Phone');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&emailOrPhone=${encodeURIComponent(emailOrPhone.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setOrder(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    created: 'Created',
    payment_pending: 'Payment Pending',
    paid: 'Paid',
    documents_pending: 'Documents Pending',
    documents_uploaded: 'Documents Uploaded',
    in_review: 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Order</h1>
        <p className="text-gray-600 mb-8">Enter your Order ID and Email or Phone to check status</p>

        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. EA123ABC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="your@email.com or 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Track
          </button>
        </form>

        {order && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' :
                  order.paymentStatus === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' :
                   order.paymentStatus === 'failed' ? 'Failed' :
                   order.paymentStatus === 'pending' ? 'Pending' : 'Created'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Document Status</span>
                <span className="font-medium">{statusLabels[order.orderStatus] || order.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
            </div>
            {order.services?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {order.services.map((s, i) => (
                    <li key={i}>{s.serviceName} ({s.categoryName})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
