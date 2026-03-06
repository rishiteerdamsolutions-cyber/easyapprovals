'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ServicePageTemplate from '@/components/services/ServicePageTemplate';
import { enrichServiceForDisplay } from '@/lib/service-display';
import type { ServiceForTemplate } from '@/components/services/ServicePageTemplate';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<ServiceForTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/services/by-slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        try {
          const enriched = enrichServiceForDisplay(data);
          setService(enriched);
        } catch {
          setService(data as ServiceForTemplate);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h1>
          <p className="text-gray-600 mb-6">The service you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
          <Link href="/services" className="text-primary-600 hover:underline">← Back to Services</Link>
        </div>
      </div>
    );
  }

  return <ServicePageTemplate service={service} />;
}
