import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Learn | Business Guides & Resources | Easy Approval',
  description:
    'Learn about GST, company registration, trademark, compliance and more. Free guides and resources for Indian businesses.',
};

export default async function LearnPage() {
  await connectDB();
  const articles = await Article.find({ type: 'learn', isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(24)
    .select('title slug excerpt tags publishedAt')
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-100 p-3 rounded-lg">
            <BookOpen className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
            <p className="text-gray-600">
              Guides and resources for Indian businesses
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {articles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <p>Articles are being added. Check back soon.</p>
              <Link href="/services" className="text-primary-600 hover:underline mt-4 inline-block">
                Browse our services →
              </Link>
            </div>
          ) : (
            articles.map((a) => (
              <Link
                key={String(a._id)}
                href={`/learn/${a.slug}`}
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
