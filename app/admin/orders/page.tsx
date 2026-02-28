'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const ADMIN_TOKEN_KEY = 'adminToken';

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    async function fetchOrders() {
      try {
        let url = '/api/admin/orders';
        if (statusFilter) url += `?status=${statusFilter}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.push('/admin/login');
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
  }, [token, statusFilter, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <Link href="/admin" className="text-primary-600 hover:underline">← Dashboard</Link>
        </div>

        <div className="mb-4 flex gap-2">
          <Link href="/admin/orders" className={`px-4 py-2 rounded-lg ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>All</Link>
          <Link href="/admin/orders?status=documents_pending" className={`px-4 py-2 rounded-lg ${statusFilter === 'documents_pending' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>Pending Upload</Link>
          <Link href="/admin/orders?status=documents_uploaded" className={`px-4 py-2 rounded-lg ${statusFilter === 'documents_uploaded' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>Uploaded</Link>
          <Link href="/admin/orders?status=in_review" className={`px-4 py-2 rounded-lg ${statusFilter === 'in_review' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>In Review</Link>
          <Link href="/admin/orders?status=approved" className={`px-4 py-2 rounded-lg ${statusFilter === 'approved' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>Approved</Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={String(order._id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {String(order.orderId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String(order.customerName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(Number(order.totalAmount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">
                        {String(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(String(order.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/orders/${order._id}`} className="text-primary-600 hover:underline">View</Link>
                      <a href={`/api/orders/${order._id}/invoice`} className="ml-2 text-primary-600 hover:underline">Invoice</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500">No orders found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
