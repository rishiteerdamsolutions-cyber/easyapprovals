import Link from 'next/link';

interface CTASectionProps {
  serviceName: string;
}

export default function CTASection({ serviceName }: CTASectionProps) {
  return (
    <section className="py-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 md:p-12 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
        <p className="mb-6 opacity-90 max-w-xl mx-auto">
          Let our experts handle your {serviceName.toLowerCase()} application.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/order"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Talk to Expert
          </Link>
        </div>
      </div>
    </section>
  );
}
