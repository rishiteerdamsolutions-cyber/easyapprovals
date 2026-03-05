import Link from 'next/link';
import { Calculator, ArrowRight } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Free Tools | GST Calculator, HSN Search | Easy Approval',
  description: 'Free business tools: GST calculator, HSN code search, company name availability check.',
};

export default async function ToolsPage() {
  await connectDB();
  const tools = await Tool.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Calculator className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Free Tools</h1>
            <p className="text-gray-600">Calculators and utilities for your business</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-gray-500">
              Tools are being added. Check back soon.
            </div>
          ) : (
            tools.map((t) => (
              <Link
                key={String(t._id)}
                href={`/tools/${t.slug}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{t.description}</p>
                <span className="text-primary-600 text-sm font-medium inline-flex items-center gap-1">
                  Use tool <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
