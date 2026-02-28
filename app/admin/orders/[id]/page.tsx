'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const ADMIN_TOKEN_KEY = 'adminToken';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [order, setOrder] = useState<{
    _id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt?: string;
    services: { serviceName: string; categoryName: string; price: number; qty: number; total: number }[];
    documents: { _id: string; fieldName: string; fileUrl: string; qualityStatus: string; rejectionReason?: string }[];
    activityLogs: { action: string; performedBy: string; timestamp: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<string | null>(null);

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
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.push('/admin/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [token, id, router]);

  const handleReview = async (documentId: string, action: 'accept' | 'reject', reason?: string) => {
    if (!token) return;
    setRejecting(documentId);
    try {
      const res = await fetch('/api/admin/documents/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId, action, rejectionReason: reason }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setOrder((prev) => {
            if (!prev) return prev;
            const docs = prev.documents.map((d) =>
              d._id === documentId
                ? { ...d, qualityStatus: action === 'accept' ? 'accepted' : 'rejected', rejectionReason: reason }
                : d
            );
            return { ...prev, documents: docs };
          });
        }
      }
    } finally {
      setRejecting(null);
    }
  };

  if (!token || loading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/orders" className="text-primary-600 hover:underline mb-4 inline-block">← Orders</Link>

        {!order ? (
          <p className="text-gray-600">Order not found</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Order {order.orderId}</h1>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Customer:</span> {order.customerName}</div>
                <div><span className="text-gray-600">Email:</span> {order.customerEmail}</div>
                <div><span className="text-gray-600">Phone:</span> {order.customerPhone}</div>
                <div><span className="text-gray-600">Total:</span> {formatCurrency(order.totalAmount)}</div>
                <div><span className="text-gray-600">Payment:</span> {order.paymentStatus}</div>
                <div><span className="text-gray-600">Status:</span> {order.orderStatus}</div>
                <div><span className="text-gray-600">Date:</span> {order.createdAt ? formatDate(order.createdAt) : '-'}</div>
              </div>
              <a href={`/api/orders/${order._id}/invoice`} className="mt-4 inline-block text-primary-600 hover:underline">Download Invoice</a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-4">
                {order.documents?.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <span className="font-medium">{doc.fieldName}</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                        doc.qualityStatus === 'accepted' ? 'bg-green-100' :
                        doc.qualityStatus === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>{doc.qualityStatus}</span>
                      {doc.rejectionReason && <p className="text-sm text-red-600 mt-1">{doc.rejectionReason}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View</a>
                      {doc.qualityStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReview(doc._id, 'accept')}
                            disabled={!!rejecting}
                            className="text-green-600 hover:underline disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleReview(doc._id, 'reject', reason);
                            }}
                            disabled={!!rejecting}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Activity Log</h2>
              <ul className="space-y-2 text-sm">
                {order.activityLogs?.map((log, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{log.action}</span>
                    <span className="text-gray-500">{formatDate(log.timestamp)} ({log.performedBy})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
