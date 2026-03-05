import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import GstCalculator from '@/components/tools/GstCalculator';
import HsnSearch from '@/components/tools/HsnSearch';
import CompanyNameChecker from '@/components/tools/CompanyNameChecker';

export const dynamic = 'force-dynamic';

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'gst-calculator': GstCalculator,
  'hsn-code-search': HsnSearch,
  'company-name-availability': CompanyNameChecker,
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await connectDB();
  const tool = await Tool.findOne({
    slug: params.slug,
    isActive: true,
  }).lean();
  if (!tool) return { title: 'Tools | Easy Approval' };
  return {
    title: `${tool.name} | Free Tools | Easy Approval`,
    description: tool.description || `${tool.name} - Free online tool from Easy Approval`,
  };
}

export default async function ToolPage({
  params,
}: {
  params: { slug: string };
}) {
  await connectDB();
  const tool = await Tool.findOne({
    slug: params.slug,
    isActive: true,
  })
    .populate('relatedServiceIds', 'name slug')
    .lean();

  if (!tool) notFound();

  const ToolComponent = TOOL_COMPONENTS[tool.slug];
  const relatedServices = (tool.relatedServiceIds || []) as { name?: string; slug?: string }[];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/tools" className="text-gray-500 hover:text-primary-600">Tools</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{tool.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h1>
            <p className="text-gray-600">{tool.description}</p>
          </div>
          <div className="p-8">
            {ToolComponent ? (
              <ToolComponent />
            ) : (
              <p className="text-gray-500">This tool is under development. Check back soon.</p>
            )}
          </div>
          {relatedServices.length > 0 && (
            <div className="border-t p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Related Services</h3>
              <ul className="space-y-2">
                {relatedServices
                  .filter((s) => s && s.slug)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${s.slug}`}
                        className="text-primary-600 hover:underline"
                      >
                        {s.name || s.slug}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link href="/tools" className="text-primary-600 hover:underline">
            ← Back to Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
