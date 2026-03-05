'use client';

import { useState } from 'react';

const SAMPLE_HSN: { code: string; desc: string; rate: number }[] = [
  { code: '9983', desc: 'Global information technology services', rate: 18 },
  { code: '9982', desc: 'IT infrastructure and network management', rate: 18 },
  { code: '9986', desc: 'Support services to manufacturing', rate: 18 },
  { code: '9985', desc: 'Transaction processing', rate: 18 },
  { code: '9971', desc: 'Leasing or rental services', rate: 18 },
  { code: '9961', desc: 'Accommodation services', rate: 18 },
  { code: '9984', desc: 'Telephone answering services', rate: 18 },
  { code: '8411', desc: 'Steam turbines', rate: 18 },
  { code: '8517', desc: 'Telephone sets', rate: 18 },
  { code: '6110', desc: 'Knitwear of wool', rate: 12 },
];

export default function HsnSearch() {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? SAMPLE_HSN.filter(
        (h) =>
          h.code.toLowerCase().includes(query.toLowerCase()) ||
          h.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search HSN/SAC Code
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 9983 or software"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {query.trim() && (
        <div className="bg-gray-50 rounded-lg divide-y max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-gray-500">No matches found. Try a different search.</div>
          ) : (
            filtered.map((h) => (
              <div key={h.code} className="p-4 flex justify-between items-start gap-4">
                <div>
                  <span className="font-mono font-semibold text-primary-600">{h.code}</span>
                  <p className="text-sm text-gray-600 mt-1">{h.desc}</p>
                </div>
                <span className="text-sm font-medium shrink-0">{h.rate}%</span>
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Sample data shown. Full HSN database can be integrated via API.
      </p>
    </div>
  );
}
