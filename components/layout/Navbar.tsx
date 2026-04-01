'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  LayoutGrid,
  ShoppingBag,
  MapPinned,
  LogIn,
} from 'lucide-react';
import MegaMenu from './MegaMenu';

const navTooltipClass =
  'pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100';

const iconNavBtnClass =
  'group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/easyapprovallogo.jpeg"
              alt="Easy Approval"
              width={40}
              height={40}
              className="mr-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xl font-bold text-primary-600">Easy Approval</span>
          </Link>

          {/* Desktop: Mega Menu */}
          <MegaMenu />

          {/* Desktop: Right side */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/services"
              className={iconNavBtnClass}
              aria-label="Browse catalog"
            >
              <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
              <span className={navTooltipClass} role="tooltip">
                Browse Catalog
              </span>
            </Link>
            <Link href="/services" className={iconNavBtnClass} aria-label="Search services">
              <Search className="h-5 w-5 shrink-0" aria-hidden />
              <span className={navTooltipClass} role="tooltip">
                Search
              </span>
            </Link>
            <Link href="/order" className={iconNavBtnClass} aria-label="Order services">
              <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
              <span className={navTooltipClass} role="tooltip">
                Order
              </span>
            </Link>
            <Link href="/track" className={iconNavBtnClass} aria-label="Track order">
              <MapPinned className="h-5 w-5 shrink-0" aria-hidden />
              <span className={navTooltipClass} role="tooltip">
                Track
              </span>
            </Link>
            {session?.user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`${iconNavBtnClass} ${isUserMenuOpen ? 'bg-primary-50 text-primary-600' : ''}`}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5 shrink-0" aria-hidden />
                  <span className={navTooltipClass} role="tooltip">
                    {session.user.name || session.user.email || 'Account'}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-gray-200 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={iconNavBtnClass} aria-label="Log in">
                  <LogIn className="h-5 w-5 shrink-0" aria-hidden />
                  <span className={navTooltipClass} role="tooltip">
                    Login
                  </span>
                </Link>
                <Link
                  href="/order"
                  className="ml-1 whitespace-nowrap rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <MegaMenu isMobile onLinkClick={() => setIsMenuOpen(false)} />
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Link
                href="/services"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Catalog
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Search Services
              </Link>
              <Link
                href="/order"
                className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Order
              </Link>
              <Link
                href="/track"
                className="block py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Track
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left py-2 text-gray-700 hover:text-primary-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/order"
                    className="block py-2 text-primary-600 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
