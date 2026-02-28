'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';

export default function AdminServicesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
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
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin" className="text-primary-600 hover:underline mb-4 inline-block">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Services Management</h1>
        <p className="text-gray-600 mb-6">Services are managed via database. Use MongoDB Compass or API to add/edit. Admin CRUD UI can be extended.</p>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((s) => (
                  <tr key={String(s._id)}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{String(s.name)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">₹{Number(s.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {typeof (s as { categoryId?: { name?: string } }).categoryId === 'object'
                        ? (s as { categoryId?: { name?: string } }).categoryId?.name
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
