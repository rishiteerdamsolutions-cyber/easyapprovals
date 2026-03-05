import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await connectDB();
  const article = await Article.findOne({
    slug: params.slug,
    type: 'blog',
    isPublished: true,
  }).lean();
  if (!article) return { title: 'Blog | Easy Approval' };
  return {
    title: `${article.title} | Blog | Easy Approval`,
    description: article.excerpt?.slice(0, 160) || article.title,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  await connectDB();
  const article = await Article.findOne({
    slug: params.slug,
    type: 'blog',
    isPublished: true,
  })
    .populate('relatedServiceIds', 'name slug')
    .lean();

  if (!article) notFound();

  const raw = (article.relatedServiceIds || []) as unknown;
  const relatedServices = (Array.isArray(raw)
    ? raw.filter(
        (s: unknown) =>
          s && typeof s === 'object' && 'slug' in s && typeof (s as { slug: unknown }).slug === 'string'
      )
    : []) as { name: string; slug: string }[];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/blog" className="text-gray-500 hover:text-primary-600">Blog</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{article.title}</span>
        </nav>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            {article.excerpt && (
              <p className="text-lg text-gray-600 mb-6">{article.excerpt}</p>
            )}
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />
          </div>

          {relatedServices.length > 0 && (
            <div className="border-t p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Related Services</h3>
              <ul className="space-y-2">
                {relatedServices.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`} className="text-primary-600 hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <div className="mt-6">
          <Link href="/blog" className="text-primary-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
