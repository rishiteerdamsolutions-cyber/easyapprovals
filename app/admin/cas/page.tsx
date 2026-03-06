'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'adminToken';

type CAStatus = 'subscribed' | 'interview_scheduled' | 'admitted' | 'rejected';

interface CA {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  status: CAStatus;
  csoScore?: number;
  generatedLogin?: string;
  notes?: string;
  admittedAt?: string;
  createdAt: string;
}

function AdminCAsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [token, setToken] = useState<string | null>(null);
  const [cas, setCas] = useState<CA[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [editScore, setEditScore] = useState<Record<string, string>>({});

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
    async function fetchCAs() {
      try {
        let url = '/api/admin/cas';
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
          setCas(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCAs();
  }, [token, statusFilter, router]);

  const updateCA = async (
    id: string,
    payload: { status?: CAStatus; csoScore?: number; notes?: string; generateLogin?: boolean }
  ) => {
    if (!token) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/cas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setCas((prev) => prev.map((c) => (c._id === id ? data : c)));
        setEditNotes((p) => ({ ...p, [id]: '' }));
        setEditScore((p) => ({ ...p, [id]: '' }));
      }
    } finally {
      setUpdating(null);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CA Partners</h1>
          <Link href="/admin" className="text-primary-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <Link
            href="/admin/cas"
            className={`px-4 py-2 rounded-lg ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </Link>
          <Link
            href="/admin/cas?status=subscribed"
            className={`px-4 py-2 rounded-lg ${statusFilter === 'subscribed' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Subscribed
          </Link>
          <Link
            href="/admin/cas?status=interview_scheduled"
            className={`px-4 py-2 rounded-lg ${statusFilter === 'interview_scheduled' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Interview
          </Link>
          <Link
            href="/admin/cas?status=admitted"
            className={`px-4 py-2 rounded-lg ${statusFilter === 'admitted' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Admitted
          </Link>
          <Link
            href="/admin/cas?status=rejected"
            className={`px-4 py-2 rounded-lg ${statusFilter === 'rejected' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSO Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cas.map((ca) => (
                  <tr key={ca._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ca.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ca.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ca.status === 'admitted'
                            ? 'bg-green-100 text-green-800'
                            : ca.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : ca.status === 'interview_scheduled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ca.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="-"
                        value={editScore[ca._id] ?? ca.csoScore ?? ''}
                        onChange={(e) => setEditScore((p) => ({ ...p, [ca._id]: e.target.value }))}
                        onBlur={() => {
                          const v = editScore[ca._id];
                          if (v !== undefined && v !== '' && Number(v) >= 0 && Number(v) <= 100) {
                            updateCA(ca._id, { csoScore: Number(v) });
                          }
                        }}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {ca.generatedLogin || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={editNotes[ca._id] ?? ca.notes ?? ''}
                        onChange={(e) => setEditNotes((p) => ({ ...p, [ca._id]: e.target.value }))}
                        onBlur={() => {
                          const v = editNotes[ca._id];
                          if (v !== undefined && v !== (ca.notes ?? '')) {
                            updateCA(ca._id, { notes: v });
                          }
                        }}
                        className="w-40 px-2 py-1 border rounded text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {ca.status === 'subscribed' && (
                        <button
                          onClick={() => updateCA(ca._id, { status: 'interview_scheduled' })}
                          disabled={!!updating}
                          className="text-yellow-600 hover:underline disabled:opacity-50"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {ca.status === 'interview_scheduled' && (
                        <>
                          <button
                            onClick={() => updateCA(ca._id, { status: 'admitted' })}
                            disabled={!!updating}
                            className="text-green-600 hover:underline disabled:opacity-50"
                          >
                            Admit
                          </button>
                          <button
                            onClick={() => updateCA(ca._id, { status: 'rejected' })}
                            disabled={!!updating}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {ca.status === 'admitted' && !ca.generatedLogin && (
                        <button
                          onClick={() => updateCA(ca._id, { generateLogin: true })}
                          disabled={!!updating}
                          className="text-primary-600 hover:underline disabled:opacity-50"
                        >
                          Generate Login
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cas.length === 0 && (
              <div className="p-8 text-center text-gray-500">No CAs found</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminCAsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AdminCAsContent />
    </Suspense>
  );
}
