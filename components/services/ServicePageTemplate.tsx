import Link from 'next/link';
import ScrollToSubpage from './ScrollToSubpage';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import DocumentsSection from './DocumentsSection';
import ProcessSection from './ProcessSection';
import PricingSection from './PricingSection';
import TimelineSection from './TimelineSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';

export interface ServiceForTemplate {
  name: string;
  slug?: string;
  description: string;
  categoryId?: { name?: string; slug?: string } | string;
  _id?: string;
  serviceCharge?: number;
  governmentFee?: number;
  professionalFee?: number;
  gstPercent?: number;
  price?: number;
  additionalCharges?: { label?: string; amount?: number }[];
  requiredDocuments?: { label?: string }[];
  processSteps?: { title: string; description?: string }[];
  benefits?: string[];
  processingTime?: string;
  faqs?: { question: string; answer?: string }[];
}

interface ServicePageTemplateProps {
  service: ServiceForTemplate;
  city?: string;
  subpage?: string;
  variation?: string;
}

function getDocLabels(docs: { label?: string }[] | undefined): string[] {
  if (!docs?.length) return [];
  return docs.map((d) => d.label || '').filter(Boolean);
}

export default function ServicePageTemplate({ service, city, subpage, variation }: ServicePageTemplateProps) {
  const categoryName =
    typeof service.categoryId === 'object' && service.categoryId?.name
      ? service.categoryId.name
      : 'Service';
  const docLabels = getDocLabels(service.requiredDocuments);

  return (
    <div className="min-h-screen bg-gray-50">
      {subpage && <ScrollToSubpage subpage={subpage} />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/order" className="text-gray-500 hover:text-primary-600">
            Order services
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{service.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <HeroSection
            name={variation ? `${service.name} - ${variation.replace(/-/g, ' ')}` : service.name}
            description={service.description || ''}
            categoryName={categoryName}
            city={city}
          />

          <div className="p-8">
            <div id="benefits"><BenefitsSection benefits={service.benefits || []} /></div>
            <div id="documents-required"><DocumentsSection documents={docLabels} /></div>
            <div id="process"><ProcessSection steps={service.processSteps || []} /></div>
            <div id="fees"><PricingSection
              serviceCharge={service.serviceCharge ?? 0}
              governmentFee={service.governmentFee ?? 0}
              professionalFee={service.professionalFee ?? 0}
              gstPercent={service.gstPercent ?? 18}
              price={service.price ?? 0}
              additionalCharges={service.additionalCharges}
              serviceId={service._id ? String(service._id) : undefined}
            /></div>
            <div id="timeline"><TimelineSection processingTime={service.processingTime || ''} /></div>
            <div id="faq"><FAQSection faqs={service.faqs || []} /></div>
            <div className="pt-6 border-t flex flex-wrap gap-4 text-sm">
              <Link href="/learn" className="text-primary-600 hover:underline">Learn</Link>
              <Link href="/tools" className="text-primary-600 hover:underline">Free Tools</Link>
              {typeof service.categoryId === 'object' && service.categoryId?.slug && (
                <Link href={`/category/${service.categoryId.slug}`} className="text-primary-600 hover:underline">
                  More {categoryName} Services
                </Link>
              )}
            </div>
            <CTASection serviceName={service.name} serviceId={service._id ? String(service._id) : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
