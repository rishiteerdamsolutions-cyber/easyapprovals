interface ProcessStep {
  title: string;
  description?: string;
}

interface ProcessSectionProps {
  steps: ProcessStep[];
}

export default function ProcessSection({ steps }: ProcessSectionProps) {
  if (!steps?.length) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Step-by-Step Process</h2>
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              {step.description && (
                <p className="text-gray-600 mt-1">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
