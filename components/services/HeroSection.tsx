import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  name: string;
  description: string;
  categoryName: string;
  city?: string;
}

export default function HeroSection({
  name,
  description,
  categoryName,
  city,
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 md:p-12 text-white rounded-t-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          {categoryName}
          {city && ` • ${city}`}
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {name}
        {city && ` in ${city}`}
      </h1>
      <p className="text-lg opacity-90 mb-6 max-w-3xl">{description}</p>
      <Link
        href="/order"
        className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Get Started
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
