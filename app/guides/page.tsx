import Link from 'next/link';
import { FileCheck, ArrowRight } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Guides | Step-by-Step Legal & Compliance Guides | Easy Approval',
  description: 'Step-by-step guides for GST, company registration, trademark, tax filing and more.',
};

export default async function GuidesPage() {
  await connectDB();
  const articles = await Article.find({ type: 'guide', isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(24)
    .select('title slug excerpt tags publishedAt')
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-100 p-3 rounded-lg">
            <FileCheck className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guides</h1>
            <p className="text-gray-600">Step-by-step legal and compliance guides</p>
          </div>
        </div>

        <div className="grid gap-6">
          {articles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <p>Guides are being added. Check back soon.</p>
              <Link href="/learn" className="text-primary-600 hover:underline mt-4 inline-block">
                Explore our learn section →
              </Link>
            </div>
          ) : (
            articles.map((a) => (
              <Link
                key={String(a._id)}
                href={`/guides/${a.slug}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{a.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{a.excerpt}</p>
                <div className="flex items-center justify-between">
                  {a.tags?.length ? (
                    <span className="text-xs text-primary-600">{a.tags.slice(0, 3).join(', ')}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-primary-600 text-sm font-medium inline-flex items-center gap-1">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
