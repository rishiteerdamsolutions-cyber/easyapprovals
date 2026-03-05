'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { navSections } from '@/lib/navigation-data';

interface MegaMenuProps {
  onLinkClick?: () => void;
  isMobile?: boolean;
}

export default function MegaMenu({ onLinkClick, isMobile = false }: MegaMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    if (!isMobile) setOpenSection(id);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setOpenSection(null);
  };

  const handleMobileToggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  if (isMobile) {
    return (
      <div className="space-y-1">
        {navSections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 last:border-0">
            <button
              onClick={() => handleMobileToggle(section.id)}
              className="flex items-center justify-between w-full py-3 text-left text-gray-700 hover:text-primary-600 font-medium"
            >
              {section.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === section.id && (
              <div className="pb-3 pl-4 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                {section.href && (
                  <Link
                    href={section.href}
                    className="block text-sm text-primary-600 hover:underline font-medium"
                    onClick={onLinkClick}
                  >
                    View All
                  </Link>
                )}
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-gray-600 hover:text-primary-600"
                    onClick={onLinkClick}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1">
      {navSections.map((section) => (
        <div
          key={section.id}
          className="relative"
          onMouseEnter={() => handleMouseEnter(section.id)}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center text-gray-700 hover:text-primary-600 font-medium py-2 px-2">
            {section.label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
          {openSection === section.id && (
            <div
              className="absolute top-full left-0 pt-1 z-50 animate-[fadeIn_0.15s_ease-out]"
              onMouseEnter={() => handleMouseEnter(section.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px]">
                {section.href && (
                  <Link
                    href={section.href}
                    className="block px-4 py-2 text-primary-600 hover:bg-primary-50 font-medium text-sm"
                  >
                    View All
                  </Link>
                )}
                {section.href && <div className="border-t border-gray-100 my-1" />}
                {section.items.slice(0, 8).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {section.items.length > 8 && (
                  <Link
                    href={section.href || '#'}
                    className="block px-4 py-2 text-primary-600 hover:bg-primary-50 text-sm font-medium"
                  >
                    + {section.items.length - 8} more
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
