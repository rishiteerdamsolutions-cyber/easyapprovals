'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Upload, FileText, Download } from 'lucide-react';

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
  services: OrderService[];
  documents: { serviceId: string; fieldName: string; fileUrl: string; qualityStatus: string }[];
}

export default function DocumentsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const allDocs: { serviceName: string; serviceId: string; fieldName: string; label: string; type: string; cropRequired?: boolean; uploaded?: { fileUrl: string; status: string } }[] = [];
  for (const svc of order.services || []) {
    const sId = typeof svc.serviceId === 'object' ? (svc.serviceId as { _id: string })._id : (svc.serviceId as string);
    const reqDocs = typeof svc.serviceId === 'object' ? (svc.serviceId as { requiredDocuments?: RequiredDoc[] }).requiredDocuments || [] : [];
    for (const rd of reqDocs) {
      const uploaded = order.documents?.find((d) => String(d.serviceId) === String(sId) && d.fieldName === rd.fieldName);
      allDocs.push({
        serviceName: svc.serviceName,
        serviceId: sId,
        fieldName: rd.fieldName,
        label: rd.label,
        type: rd.type,
        cropRequired: rd.cropRequired,
        uploaded: uploaded ? { fileUrl: uploaded.fileUrl, status: uploaded.qualityStatus } : undefined,
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Required Documents</h2>
          <div className="space-y-4">
            {allDocs.map((doc) => (
              <div key={`${doc.serviceName}-${doc.fieldName}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className="font-medium">{doc.serviceName}</span>
                  <span className="text-gray-600"> - {doc.label}</span>
                  <span className="text-xs text-gray-500 ml-2">({doc.type})</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.uploaded ? (
                    <>
                      <span className={`text-sm px-2 py-1 rounded ${
                        doc.uploaded.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        doc.uploaded.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.uploaded.status}
                      </span>
                      <a href={doc.uploaded.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> View
                      </a>
                      <Link href={`/order/${id}/upload?serviceId=${doc.serviceId}&field=${doc.fieldName}${doc.cropRequired ? '&crop=true' : ''}`} className="text-sm text-primary-600 hover:underline">
                        Replace
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/order/${id}/upload?serviceId=${doc.serviceId}&field=${doc.fieldName}${doc.cropRequired ? '&crop=true' : ''}`}
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      <Upload className="h-4 w-4" /> Upload
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href={`/api/orders/${id}/invoice`} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            <FileText className="h-4 w-4" /> Download Invoice
          </Link>
          <Link href="/track" className="inline-flex items-center gap-2 text-primary-600 hover:underline">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
