'use client';

import { useState } from 'react';

export default function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  const num = parseFloat(amount) || 0;
  let gstAmount = 0;
  let total = 0;
  let base = 0;

  if (mode === 'exclusive') {
    base = num;
    gstAmount = (base * gstRate) / 100;
    total = base + gstAmount;
  } else {
    total = num;
    base = total / (1 + gstRate / 100);
    gstAmount = total - base;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('exclusive')}
          className={`px-4 py-2 rounded-lg font-medium ${
            mode === 'exclusive'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Add GST
        </button>
        <button
          type="button"
          onClick={() => setMode('inclusive')}
          className={`px-4 py-2 rounded-lg font-medium ${
            mode === 'inclusive'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Remove GST
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'exclusive' ? 'Base Amount (₹)' : 'Amount with GST (₹)'}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
        <select
          value={gstRate}
          onChange={(e) => setGstRate(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value={5}>5%</option>
          <option value={12}>12%</option>
          <option value={18}>18%</option>
          <option value={28}>28%</option>
        </select>
      </div>

      {(base > 0 || total > 0) && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Amount</span>
            <span className="font-semibold">₹{base.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST ({gstRate}%)</span>
            <span className="font-semibold">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold text-primary-600">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
