import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Service from '@/models/Service';
import Article from '@/models/Article';
import Tool from '@/models/Tool';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await connectDB();
  const category = await Category.findOne({
    slug: params.slug,
    isActive: true,
  }).lean();
  if (!category) return { title: 'Category | Easy Approval' };
  return {
    title: `${category.name} | Services | Easy Approval`,
    description:
      category.description ||
      `${category.name} - Professional compliance and registration services from Easy Approval`,
  };
}

export default async function CategoryIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  await connectDB();
  const category = await Category.findOne({
    slug: params.slug,
    isActive: true,
  }).lean();

  if (!category) notFound();

  const [services, articles, tools] = await Promise.all([
    Service.find({ categoryId: category._id, isActive: true })
      .sort({ name: 1 })
      .select('name slug description price serviceCharge governmentFee gstPercent')
      .lean(),
    Article.find({
      isPublished: true,
      $or: [
        { tags: { $regex: new RegExp(category.name.split(' ')[0], 'i') } },
        { type: 'learn' },
      ],
    })
      .limit(5)
      .select('title slug excerpt type')
      .lean(),
    Tool.find({ isActive: true }).limit(5).select('name slug description').lean(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/services" className="text-gray-500 hover:text-primary-600">Services</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-lg text-gray-600">
            {category.description || `Browse ${category.name} services`}
          </p>
        </div>

        {/* Services grid */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s) => {
              const sc = s.serviceCharge ?? 0;
              const gf = s.governmentFee ?? 0;
              const pf = 0;
              const subtotal = sc + gf + pf > 0 ? sc + gf + pf : s.price;
              const gst = Math.round(subtotal * ((s.gstPercent ?? 18) / 100));
              const total = subtotal + gst;
              return (
                <Link
                  key={String(s._id)}
                  href={`/${s.slug}`}
                  className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{s.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{s.description}</p>
                  <span className="text-primary-600 font-semibold">
                    ₹{total.toLocaleString()} onwards
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Internal links: Learn & Tools */}
        <div className="grid gap-8 md:grid-cols-2">
          {articles.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Related Guides</h2>
              <ul className="space-y-2">
                {articles.map((a) => (
                  <li key={String(a._id)}>
                    <Link
                      href={`/${a.type}/${a.slug}`}
                      className="text-primary-600 hover:underline"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {tools.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Free Tools</h2>
              <ul className="space-y-2">
                {tools.map((t) => (
                  <li key={String(t._id)}>
                    <Link
                      href={`/tools/${t.slug}`}
                      className="text-primary-600 hover:underline"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
