import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServiceBySlug, serviceCategories } from '@/lib/services-data';
import { CheckCircle, Clock, FileText, Shield, ArrowRight } from 'lucide-react';

export async function generateStaticParams() {
  // This will be populated with all service slugs
  const { services } = await import('@/lib/services-data');
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const category = serviceCategories.find(c => c.id === service.category);

  const totalPrice = service.basePrice + service.governmentFee;
  const gst = Math.round(totalPrice * 0.18);
  const finalPrice = totalPrice + gst;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/services" className="text-gray-500 hover:text-primary-600">Services</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{service.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {category?.name || service.category}
              </span>
              {service.popular && (
                <span className="text-sm bg-secondary-500 px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
            <p className="text-lg opacity-90">{service.description}</p>
          </div>

          <div className="p-8">
            {/* Pricing Card */}
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Starting from</div>
                  <div className="text-4xl font-bold text-primary-600">
                    ₹{service.basePrice.toLocaleString()}
                  </div>
                  {service.governmentFee > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      + ₹{service.governmentFee.toLocaleString()} government fees
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Processing Time</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {service.processingTime}
                  </div>
                </div>
              </div>
              <div className="border-t border-primary-200 pt-4 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-semibold">₹{service.basePrice.toLocaleString()}</span>
                </div>
                {service.governmentFee > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Government Fee:</span>
                    <span className="font-semibold">₹{service.governmentFee.toLocaleString()}</span>
                  </div>
                )}
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
                href={`/orders/new?service=${service.id}`}
                className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Required Documents</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Use Case */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Who Needs This?</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700">{service.useCase}</p>
              </div>
            </div>

            {/* Process */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fill Application Form</h3>
                    <p className="text-gray-600 text-sm">Provide your business details and required information.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Upload Documents</h3>
                    <p className="text-gray-600 text-sm">Upload all required documents securely.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Make Payment</h3>
                    <p className="text-gray-600 text-sm">Complete payment securely through our platform.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">We Process Your Application</h3>
                    <p className="text-gray-600 text-sm">Our expert team processes your application and files with government.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Receive Confirmation</h3>
                    <p className="text-gray-600 text-sm">Get your certificate and confirmation documents.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
              <p className="mb-6 opacity-90">Let our experts handle your {service.name.toLowerCase()} application.</p>
              <Link
                href={`/orders/new?service=${service.id}`}
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

