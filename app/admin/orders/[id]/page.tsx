'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const ADMIN_TOKEN_KEY = 'adminToken';

interface CA {
  _id: string;
  name: string;
  email: string;
}

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
    assignedToCa?: string;
    assignedCaId?: string | { _id: string; name: string; email: string };
    complexity?: string;
    customerVerified?: boolean;
    caMarkedCompleteAt?: string;
    createdAt?: string;
    services: { serviceName: string; categoryName: string; price: number; qty: number; total: number; professionalFee?: number }[];
    documents: { _id: string; fieldName: string; fileUrl: string; qualityStatus: string; rejectionReason?: string }[];
    activityLogs: { action: string; performedBy: string; timestamp: string }[];
  } | null>(null);
  const [cas, setCas] = useState<CA[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedCaId, setSelectedCaId] = useState('');
  const [complexity, setComplexity] = useState('');

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

  useEffect(() => {
    if (!token) return;
    async function fetchCAs() {
      try {
        const res = await fetch('/api/admin/cas?status=admitted', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCas(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCAs();
  }, [token]);

  useEffect(() => {
    if (order) {
      const caId = typeof order.assignedCaId === 'object' && order.assignedCaId ? order.assignedCaId._id : order.assignedCaId;
      setSelectedCaId(caId || '');
      setComplexity(order.complexity || '');
    }
  }, [order?.assignedCaId, order?.complexity]);

  const handleAssignCa = async () => {
    if (!token) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedCaId: selectedCaId || null,
          complexity: complexity || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder((prev) =>
          prev ? { ...prev, assignedCaId: data.assignedCaId, assignedToCa: data.assignedToCa, complexity: data.complexity, orderStatus: data.orderStatus } : prev
        );
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleVerifyCustomer = async () => {
    if (!token) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/verify-customer`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => prev ? { ...prev, customerVerified: data.customerVerified, orderStatus: data.orderStatus } : prev);
      }
    } finally {
      setVerifying(false);
    }
  };

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
                <div><span className="text-gray-600">Assigned to CA:</span> {order.assignedToCa || (typeof order.assignedCaId === 'object' && order.assignedCaId ? `${order.assignedCaId.name}` : '-')}</div>
                <div><span className="text-gray-600">Complexity:</span> {order.complexity || '-'}</div>
                <div><span className="text-gray-600">Customer verified:</span> {order.customerVerified ? 'Yes' : 'No'}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  value={selectedCaId}
                  onChange={(e) => setSelectedCaId(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select CA</option>
                  {cas.map((ca) => (
                    <option key={ca._id} value={ca._id}>{ca.name} ({ca.email})</option>
                  ))}
                </select>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Complexity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={handleAssignCa}
                  disabled={assigning}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                >
                  {assigning ? 'Saving...' : 'Assign'}
                </button>
                {order.orderStatus === 'ca_completed' && !order.customerVerified && (
                  <button
                    onClick={handleVerifyCustomer}
                    disabled={verifying}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {verifying ? 'Saving...' : 'Mark Customer Satisfied'}
                  </button>
                )}
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
