import Link from 'next/link';
import { footerColumns, footerBottomLinks } from '@/lib/navigation-data';
import { SITE_LEGAL } from '@/lib/site-legal';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src="/easyapprovallogo.jpeg"
                alt="Easy Approval"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold">Easy Approval</span>
            </div>
            <p className="text-gray-400 text-sm">
              India&apos;s leading AI-powered corporate services and compliance platform.
            </p>
          </div>

          {/* Dynamic columns from navigation-data */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-gray-400 sm:text-left">
              &copy; {new Date().getFullYear()} {SITE_LEGAL.legalEntityName}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
              {footerBottomLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-gray-800/80 pt-6 sm:flex-row sm:gap-3">
            <span className="text-xs text-gray-500">Built by</span>
            <span className="flex items-center gap-2">
              <img
                src="/A-logo.png"
                alt="AI Developer India"
                className="h-7 w-auto max-h-8 object-contain opacity-90"
              />
              <span className="text-sm font-medium text-gray-300">AI Developer India</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
