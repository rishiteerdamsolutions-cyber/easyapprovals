'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const CA_TOKEN_KEY = 'caToken';

export default function CADashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<
    {
      _id: string;
      orderId: string;
      customerName: string;
      customerEmail: string;
      totalAmount: number;
      orderStatus: string;
      caMarkedCompleteAt?: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(CA_TOKEN_KEY);
    if (!t) {
      router.push('/ca/login');
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    async function fetchOrders() {
      try {
        const res = await fetch('/api/ca/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem(CA_TOKEN_KEY);
          router.push('/ca/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token, router]);

  const handleComplete = async (orderId: string) => {
    if (!token) return;
    setCompleting(orderId);
    try {
      const res = await fetch(`/api/ca/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...data } : o))
        );
      }
    } finally {
      setCompleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(CA_TOKEN_KEY);
    router.push('/ca/login');
  };

  if (!token || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => !['ca_completed', 'customer_verified', 'approved', 'completed', 'rejected'].includes(o.orderStatus)
  );
  const completedOrders = orders.filter((o) =>
    ['ca_completed', 'customer_verified', 'approved', 'completed'].includes(o.orderStatus)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">CA Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Assigned Orders</h2>
        </div>

        {activeOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <h3 className="px-6 py-3 bg-gray-50 font-medium text-gray-900">Active</h3>
            <div className="divide-y">
              {activeOrders.map((order) => (
                <div
                  key={order._id}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-medium">{order.orderId}</span>
                    <span className="text-gray-500 ml-2">– {order.customerName}</span>
                    <span className="block text-sm text-gray-500">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100">{order.orderStatus}</span>
                    <button
                      onClick={() => handleComplete(order._id)}
                      disabled={!!completing}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                      {completing === order._id ? 'Marking...' : 'Mark Complete'}
                    </button>
                    <Link
                      href={`/order/${order._id}/documents`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="px-6 py-3 bg-gray-50 font-medium text-gray-900">Completed</h3>
            <div className="divide-y">
              {completedOrders.map((order) => (
                <div
                  key={order._id}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-medium">{order.orderId}</span>
                    <span className="text-gray-500 ml-2">– {order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100">{order.orderStatus}</span>
                    {order.caMarkedCompleteAt && (
                      <span className="text-sm text-gray-500">
                        {formatDate(order.caMarkedCompleteAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No orders assigned yet
          </div>
        )}
      </div>
    </div>
  );
}
