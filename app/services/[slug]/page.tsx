import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

export const dynamic = 'force-dynamic';

async function getService(slug: string) {
  await connectDB();
  const service = await Service.findOne({ slug, isActive: true })
    .populate('categoryId', 'name slug')
    .lean();
  return service ? JSON.parse(JSON.stringify(service)) : null;
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);

  if (!service) {
    notFound();
  }

  const categoryName = typeof service.categoryId === 'object' ? service.categoryId?.name : '';
  const price = service.price || 0;
  const gst = Math.round(price * 0.18);
  const finalPrice = price + gst;
  const reqDocs = service.requiredDocuments || [];
  const docLabels = reqDocs.map((d: { label?: string }) => d.label || '');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/services" className="text-gray-500 hover:text-primary-600">Services</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{service.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {categoryName || 'Service'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
            <p className="text-lg opacity-90">{service.description}</p>
          </div>

          <div className="p-8">
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Starting from</div>
                  <div className="text-4xl font-bold text-primary-600">
                    ₹{price.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="border-t border-primary-200 pt-4 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-semibold">₹{price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-semibold">₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary-200">
                  <span>Total:</span>
                  <span className="text-primary-600">₹{finalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/order"
                className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {docLabels.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Required Documents</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {docLabels.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
              <p className="mb-6 opacity-90">Let our experts handle your {service.name.toLowerCase()} application.</p>
              <Link
                href="/order"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Your Application
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
