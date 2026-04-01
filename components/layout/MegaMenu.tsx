'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  Rocket,
  FileCheck,
  Scale,
  Receipt,
  Calculator,
  ShieldCheck,
  BookOpen,
  UsersRound,
  GraduationCap,
} from 'lucide-react';
import { navSections } from '@/lib/navigation-data';

const SECTION_ICONS: Record<string, LucideIcon> = {
  'start-business': Rocket,
  registrations: FileCheck,
  trademark: Scale,
  gst: Receipt,
  'income-tax': Calculator,
  compliance: ShieldCheck,
  accounting: BookOpen,
  'hr-payroll': UsersRound,
  resources: GraduationCap,
};

interface MegaMenuProps {
  onLinkClick?: () => void;
  isMobile?: boolean;
}

export default function MegaMenu({ onLinkClick, isMobile = false }: MegaMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const menuRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openSection || isMobile) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (menuRootRef.current && !menuRootRef.current.contains(e.target as Node)) {
        setOpenSection(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSection(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openSection, isMobile]);

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
              className="flex items-center justify-between w-full py-2.5 text-left text-sm text-gray-700 hover:text-primary-600 font-medium"
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
    <div ref={menuRootRef} className="hidden md:flex items-center gap-0.5">
      {navSections.map((section) => {
        const Icon = SECTION_ICONS[section.id] || FileCheck;
        const isOpen = openSection === section.id;
        return (
          <div key={section.id} className="relative">
            <button
              type="button"
              onClick={() => setOpenSection((prev) => (prev === section.id ? null : section.id))}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-label={section.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                isOpen ? 'bg-primary-50 text-primary-600' : ''
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span
                className="pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                role="tooltip"
              >
                {section.label}
              </span>
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full z-50 pt-1 animate-[fadeIn_0.15s_ease-out]">
                <div className="min-w-[220px] rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                  {section.href && (
                    <Link
                      href={section.href}
                      className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
                      onClick={() => setOpenSection(null)}
                    >
                      View All
                    </Link>
                  )}
                  {section.href && <div className="my-1 border-t border-gray-100" />}
                  {section.items.slice(0, 8).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setOpenSection(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {section.items.length > 8 && (
                    <Link
                      href={section.href || '#'}
                      className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
                      onClick={() => setOpenSection(null)}
                    >
                      + {section.items.length - 8} more
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
