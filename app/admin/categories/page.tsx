'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
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
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin" className="text-primary-600 hover:underline mb-4 inline-block">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories Management</h1>
        <p className="text-gray-600 mb-6">Categories are managed via database. Use seed script or MongoDB to add/edit.</p>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((c) => (
                  <tr key={String(c._id)}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{String(c.name)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{String(c.slug)}</td>
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
