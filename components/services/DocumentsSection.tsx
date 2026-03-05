import { FileText } from 'lucide-react';

interface DocumentsSectionProps {
  documents: string[];
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  if (!documents?.length) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Documents Required</h2>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="text-gray-700">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
