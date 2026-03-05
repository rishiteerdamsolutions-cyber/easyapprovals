'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, Calendar } from 'lucide-react';

const ADMIN_TOKEN_KEY = 'adminToken';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: string;
  serviceSlug?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

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
    async function fetchLeads() {
      try {
        const url = filterUnread ? '/api/admin/leads?unread=true' : '/api/admin/leads';
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
          setLeads(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [token, router, filterUnread]);

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, isRead: true } : l)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!token || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filterUnread}
                  onChange={(e) => setFilterUnread(e.target.checked)}
                />
                Unread only
              </label>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No leads found.
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead._id}
                className={`bg-white rounded-lg shadow p-6 ${!lead.isRead ? 'border-l-4 border-primary-600' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(lead.createdAt).toLocaleString()}
                      </span>
                      {lead.source && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      )}
                    </div>
                    {lead.subject && (
                      <p className="text-sm font-medium text-gray-700 mt-2">Subject: {lead.subject}</p>
                    )}
                    <p className="text-gray-700 mt-2">{lead.message}</p>
                    {lead.serviceSlug && (
                      <Link
                        href={`/${lead.serviceSlug}`}
                        className="text-primary-600 text-sm mt-2 inline-block"
                      >
                        View service →
                      </Link>
                    )}
                  </div>
                  {!lead.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(lead._id)}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
