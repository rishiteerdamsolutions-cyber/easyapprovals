'use client';

import { useState } from 'react';

export default function CompanyNameChecker() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const handleCheck = () => {
    if (!name.trim()) return;
    setResult('checking');
    // Simulate MCA API call - in production, call /api/mca/check-name
    setTimeout(() => {
      const taken = ['pvt ltd', 'private limited', 'tech', 'solution'].some((w) =>
        name.toLowerCase().includes(w)
      );
      setResult(taken ? 'taken' : 'available');
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proposed Company Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setResult('idle');
          }}
          placeholder="e.g. ABC Solutions Pvt Ltd"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        type="button"
        onClick={handleCheck}
        disabled={!name.trim() || result === 'checking'}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {result === 'checking' ? 'Checking...' : 'Check Availability'}
      </button>
      {result === 'available' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Name appears available. Final approval subject to MCA verification.
        </div>
      )}
      {result === 'taken' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          Similar names may exist. Try a more unique name or verify on MCA portal.
        </div>
      )}
      <p className="text-xs text-gray-500">
        This is a preliminary check. Official availability is confirmed by MCA during registration.
      </p>
    </div>
  );
}
