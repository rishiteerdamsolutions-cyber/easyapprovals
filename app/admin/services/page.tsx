'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const ADMIN_TOKEN_KEY = 'adminToken';

type AdditionalLine = { label: string; amount: number };

type AdminService = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  gstPercent?: number;
  governmentFee?: number;
  professionalFee?: number;
  serviceCharge?: number;
  additionalCharges?: AdditionalLine[];
  useDatabasePricing?: boolean;
  categoryId?: { name?: string } | string;
};

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        router.push('/admin/login');
        return;
      }
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load');
      const list = Array.isArray(data) ? data : [];
      setRows(
        list.map((s: Record<string, unknown>) => ({
          _id: String(s._id),
          name: String(s.name ?? ''),
          slug: typeof s.slug === 'string' ? s.slug : undefined,
          price: Number(s.price) || 0,
          gstPercent: Number.isFinite(Number(s.gstPercent)) ? Number(s.gstPercent) : 18,
          governmentFee: Number(s.governmentFee) || 0,
          professionalFee: Number(s.professionalFee) || 0,
          serviceCharge: Number(s.serviceCharge) || 0,
          additionalCharges: Array.isArray(s.additionalCharges)
            ? (s.additionalCharges as AdditionalLine[]).map((a) => ({
                label: String(a.label || ''),
                amount: Number(a.amount) || 0,
              }))
            : [],
          useDatabasePricing: s.useDatabasePricing !== false,
          categoryId: s.categoryId as AdminService['categoryId'],
        }))
      );
    } catch (e) {
      setMessage((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (id: string, patch: Partial<AdminService>) => {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, ...patch } : r)));
  };

  const setAdditional = (id: string, index: number, field: keyof AdditionalLine, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== id) return r;
        const next = [...(r.additionalCharges || [])];
        const row = { ...next[index], [field]: field === 'amount' ? num(value) : value };
        next[index] = row;
        return { ...r, additionalCharges: next };
      })
    );
  };

  const addAdditional = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, additionalCharges: [...(r.additionalCharges || []), { label: '', amount: 0 }] }
          : r
      )
    );
  };

  const removeAdditional = (id: string, index: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              additionalCharges: (r.additionalCharges || []).filter((_, i) => i !== index),
            }
          : r
      )
    );
  };

  const saveRow = async (s: AdminService) => {
    if (!token) return;
    setSavingId(s._id);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/services/${s._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: s.name,
          price: s.price,
          gstPercent: s.gstPercent ?? 18,
          governmentFee: s.governmentFee ?? 0,
          professionalFee: s.professionalFee ?? 0,
          serviceCharge: s.serviceCharge ?? 0,
          additionalCharges: (s.additionalCharges || []).filter((a) => a.amount > 0),
          useDatabasePricing: s.useDatabasePricing !== false,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((data as { error?: string }).error || 'Save failed');
      setMessage('Saved. Live site will show updated prices on next request.');
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Services &amp; pricing</h1>
        <p className="text-gray-600 mb-4 max-w-3xl">
          Edit item price, GST %, named additional charges, and professional fees. Changes save to the
          database and appear on the public site immediately (no redeploy). Keep &quot;Use database
          pricing&quot; on unless you intentionally want legacy Excel-based fees.
        </p>
        {message && (
          <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-gray-800">
            {message}
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            Loading services…
          </div>
        ) : (
          <div className="space-y-6">
            {rows.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{s.name}</h2>
                    <p className="text-xs text-gray-500">
                      {typeof s.categoryId === 'object' && s.categoryId?.name
                        ? s.categoryId.name
                        : 'Category'}
                      {s.slug ? ` · /${s.slug}` : ''}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 shrink-0">
                    <input
                      type="checkbox"
                      checked={s.useDatabasePricing !== false}
                      onChange={(e) => updateRow(s._id, { useDatabasePricing: e.target.checked })}
                    />
                    Use database pricing (recommended)
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Service name</span>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateRow(s._id, { name: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Item price (₹)</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={s.price}
                      onChange={(e) => updateRow(s._id, { price: num(e.target.value) })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">GST %</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={s.gstPercent ?? 18}
                      onChange={(e) => updateRow(s._id, { gstPercent: num(e.target.value) })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Government fee (₹)</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={s.governmentFee ?? 0}
                      onChange={(e) => updateRow(s._id, { governmentFee: num(e.target.value) })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Professional charges (₹)</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={s.professionalFee ?? 0}
                      onChange={(e) => updateRow(s._id, { professionalFee: num(e.target.value) })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600 font-medium">Service charge (₹, optional)</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={s.serviceCharge ?? 0}
                      onChange={(e) => updateRow(s._id, { serviceCharge: num(e.target.value) })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Additional charges</span>
                    <button
                      type="button"
                      onClick={() => addAdditional(s._id)}
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
                    >
                      <Plus className="h-4 w-4" />
                      Add line
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(s.additionalCharges || []).length === 0 && (
                      <p className="text-xs text-gray-500">No extra lines (optional).</p>
                    )}
                    {(s.additionalCharges || []).map((line, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-end">
                        <label className="flex-1 min-w-[140px] text-xs">
                          <span className="text-gray-500">Name</span>
                          <input
                            type="text"
                            value={line.label}
                            onChange={(e) => setAdditional(s._id, idx, 'label', e.target.value)}
                            placeholder="e.g. Filing fee"
                            className="mt-0.5 w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </label>
                        <label className="w-32 text-xs">
                          <span className="text-gray-500">Amount (₹)</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={line.amount}
                            onChange={(e) => setAdditional(s._id, idx, 'amount', e.target.value)}
                            className="mt-0.5 w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAdditional(s._id, idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void saveRow(s)}
                    disabled={savingId === s._id}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {savingId === s._id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save changes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
