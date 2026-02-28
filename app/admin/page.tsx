'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  Upload,
} from 'lucide-react';

const ADMIN_TOKEN_KEY = 'adminToken';

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalOrders: number;
    paidOrders: number;
    pendingUploads: number;
    inReview: number;
    approved: number;
    revenue: number;
  } | null>(null);
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
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.push('/admin/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token, router]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    router.push('/admin/login');
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">
                Orders
              </Link>
              <Link href="/admin/services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
              <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900">
                Categories
              </Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders ?? 0}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.paidOrders ?? 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Uploads</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingUploads ?? 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Upload className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{(stats?.revenue ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">In Review</h2>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats?.inReview ?? 0}</p>
            <Link href="/admin/orders?status=in_review" className="text-primary-600 text-sm mt-2 inline-block">
              View orders →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Approved</h2>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats?.approved ?? 0}</p>
            <Link href="/admin/orders?status=approved" className="text-primary-600 text-sm mt-2 inline-block">
              View orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
