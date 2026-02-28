import Link from "next/link";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Service from "@/models/Service";

async function getHomeData() {
  try {
    await connectDB();
    const [categories, services] = await Promise.all([
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
      Service.find({ isActive: true }).limit(8).lean(),
    ]);
    return {
      categories: JSON.parse(JSON.stringify(categories)),
      services: JSON.parse(JSON.stringify(services)),
    };
  } catch {
    return { categories: [], services: [] };
  }
}

export default async function Home() {
  const { categories, services } = await getHomeData();

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              India&apos;s Leading AI-Powered
              <br />
              <span className="text-primary-600">Corporate Services & Compliance Platform</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of businesses who trust Easy Approval to simplify and automate their 
              MCA, GST, and Income Tax compliance. Our AI-powered platform delivers end-to-end 
              workflows, paperless filing, and secure cloud storage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/order"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
              >
                Order Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/services"
                className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">10,000+</div>
              <div className="text-gray-600 mt-2">Businesses Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">150+</div>
              <div className="text-gray-600 mt-2">Services</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">99%</div>
              <div className="text-gray-600 mt-2">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600 mt-2">Support</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Services</h2>
          {categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category: { _id: string; name: string; slug: string }) => (
              <Link
                key={category._id}
                href={`/order?category=${category.slug}`}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">
                  Complete solutions for {category.name.toLowerCase()}
                </p>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Services</h2>
            <Link
              href="/services"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: { _id: string; name: string; slug: string; description?: string; price?: number }) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold">
                    ₹{(service.price || 0).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Easy Approval?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Bank-level security with encrypted data storage and secure payment processing.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
              <p className="text-gray-600">
                AI-powered automation ensures quick processing and faster turnaround times.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Dedicated CA support team to guide you through every step of the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses simplifying their compliance with Easy Approval.
          </p>
          <Link
            href="/order"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Order Services
          </Link>
        </div>
      </section>
    </div>
  );
}
