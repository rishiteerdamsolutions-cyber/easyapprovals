import { CheckCircle } from 'lucide-react';

interface BenefitsSectionProps {
  benefits: string[];
}

export default function BenefitsSection({ benefits }: BenefitsSectionProps) {
  if (!benefits?.length) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Benefits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <CheckCircle className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
            <span className="text-gray-700">{benefit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
