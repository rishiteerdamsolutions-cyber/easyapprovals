import { Clock } from 'lucide-react';

interface TimelineSectionProps {
  processingTime: string;
}

export default function TimelineSection({ processingTime }: TimelineSectionProps) {
  if (!processingTime?.trim()) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Timeline</h2>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Clock className="h-6 w-6 text-primary-600" />
        <div>
          <span className="font-medium text-gray-900">Processing time</span>
          <p className="text-gray-600">{processingTime}</p>
        </div>
      </div>
    </section>
  );
}
