'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const ADMIN_TOKEN_KEY = 'adminToken';

function AdminPayoutsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year') || String(new Date().getFullYear());
  const monthParam = searchParams.get('month') || String(new Date().getMonth() + 1);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<{
    year: number;
    month: number;
    totalProfessionalFee: number;
    platformShare: number;
    caPool: number;
    expenditure: number;
    platformNet: number;
    caPayouts: { caId: string; name: string; email: string; fee: number; share: number }[];
    orderCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenditureAmount, setExpenditureAmount] = useState('');
  const [expenditureNotes, setExpenditureNotes] = useState('');
  const [savingExpenditure, setSavingExpenditure] = useState(false);

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
    async function fetchPayouts() {
      try {
        const res = await fetch(
          `/api/admin/payouts?year=${yearParam}&month=${monthParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          router.push('/admin/login');
          return;
        }
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setExpenditureAmount(d.expenditure ? String(d.expenditure) : '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPayouts();
  }, [token, yearParam, monthParam, router]);

  const handleSaveExpenditure = async () => {
    if (!token) return;
    setSavingExpenditure(true);
    try {
      const res = await fetch('/api/admin/expenditure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: data?.year || yearParam,
          month: data?.month || monthParam,
          amount: parseFloat(expenditureAmount) || 0,
          notes: expenditureNotes,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setData((prev) => (prev ? { ...prev, expenditure: d.amount, platformNet: prev.platformShare - d.amount } : prev));
      }
    } finally {
      setSavingExpenditure(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (!token || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <Link href="/admin" className="text-primary-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <div className="mb-6 flex gap-2 items-center">
          <select
            value={monthParam}
            onChange={(e) => router.push(`/admin/payouts?year=${yearParam}&month=${e.target.value}`)}
            className="px-3 py-2 border rounded-lg"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={yearParam}
            onChange={(e) => router.push(`/admin/payouts?year=${e.target.value}&month=${monthParam}`)}
            className="px-3 py-2 border rounded-lg"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Professional Fee</p>
                <p className="text-xl font-bold">{formatCurrency(data.totalProfessionalFee)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Platform (50%)</p>
                <p className="text-xl font-bold">{formatCurrency(data.platformShare)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">CA Pool (50%)</p>
                <p className="text-xl font-bold">{formatCurrency(data.caPool)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-xl font-bold">{data.orderCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Expenditure (this month)</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="number"
                  value={expenditureAmount}
                  onChange={(e) => setExpenditureAmount(e.target.value)}
                  placeholder="Amount"
                  className="px-3 py-2 border rounded-lg w-32"
                />
                <input
                  type="text"
                  value={expenditureNotes}
                  onChange={(e) => setExpenditureNotes(e.target.value)}
                  placeholder="Notes"
                  className="px-3 py-2 border rounded-lg flex-1 min-w-[200px]"
                />
                <button
                  onClick={handleSaveExpenditure}
                  disabled={savingExpenditure}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingExpenditure ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Platform net: {formatCurrency(data.platformNet)} (platform share − expenditure)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="px-6 py-3 bg-gray-50 font-semibold text-gray-900">CA Payouts</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fee Contribution</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Share (50% pool)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.caPayouts.map((ca) => (
                    <tr key={ca.caId} className="border-b">
                      <td className="px-6 py-4">
                        <span className="font-medium">{ca.name}</span>
                        <span className="block text-sm text-gray-500">{ca.email}</span>
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(ca.fee)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(ca.share)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.caPayouts.length === 0 && (
                <div className="p-8 text-center text-gray-500">No CA payouts for this month</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No payout data
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPayoutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AdminPayoutsContent />
    </Suspense>
  );
}
