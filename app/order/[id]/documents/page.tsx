'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, FileText } from 'lucide-react';

interface RequiredDoc {
  fieldName: string;
  label: string;
  type: string;
  cropRequired: boolean;
  isMandatory: boolean;
}

interface OrderService {
  serviceId: { _id: string; name: string; requiredDocuments: RequiredDoc[] };
  serviceName: string;
  categoryName: string;
}

interface OrderData {
  _id: string;
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  services: OrderService[];
  documents: { serviceId: string; fieldName: string; fileUrl: string; qualityStatus: string }[];
}

export default function DocumentsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentsEmail, setDocumentsEmail] = useState('aideveloperindia@gmail.com');

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((d) => setDocumentsEmail(d.documentsEmail || 'aideveloperindia@gmail.com')).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

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

  // Mandatory default documents - always included
  const defaultDocs: { serviceName: string; label: string; type: string }[] = [
    { serviceName: 'Identity', label: 'PAN Card', type: 'pdf' },
    { serviceName: 'Identity', label: 'Aadhaar Card', type: 'pdf' },
  ];

  const allDocs: { serviceName: string; label: string; type: string }[] = [...defaultDocs];

  for (const svc of order.services || []) {
    const reqDocs = typeof svc.serviceId === 'object' ? (svc.serviceId as { requiredDocuments?: RequiredDoc[] }).requiredDocuments || [] : [];
    for (const rd of reqDocs) {
      // Skip if already in default docs
      if (rd.label === 'PAN Card' || rd.label === 'Aadhaar Card') continue;
      allDocs.push({
        serviceName: svc.serviceName,
        label: rd.label,
        type: rd.type || 'pdf',
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">Order ID: {order.orderId}</p>
        </div>

        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Send documents via Gmail/Email</h2>
          <p className="text-gray-700 mb-4">Attach your documents and email them to us. Use subject line: <strong>Documents - Order {order.orderId}</strong></p>
          <a
            href={`mailto:${documentsEmail}?subject=Documents - Order ${order.orderId}`}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Send Required Documents
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Required Documents</h2>
          <p className="text-sm text-gray-600 mb-4">Send these documents via email (subject: Documents - Order {order.orderId})</p>
          <ul className="space-y-3">
            {allDocs.map((doc, idx) => (
              <li key={`${doc.serviceName}-${doc.label}-${idx}`} className="flex items-center gap-2 p-3 border rounded-lg">
                <span className="font-medium text-gray-900">{doc.label}</span>
                <span className="text-xs text-gray-500">({doc.type})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          {order.paymentStatus === 'paid' && (
            <a href={`/api/orders/${id}/invoice`} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
              <FileText className="h-4 w-4" /> Download Invoice
            </a>
          )}
          <Link href="/track" className="inline-flex items-center gap-2 text-primary-600 hover:underline">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
