'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, User, LogOut, ChevronDown } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const user: User | null = null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/easyapprovallogo.png"
              alt="Easy Approval"
              width={40}
              height={40}
              className="mr-2"
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-2xl font-bold text-primary-600">Easy Approval</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="flex items-center text-gray-700 hover:text-primary-600 font-medium py-2"
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isServicesOpen && (
                <div
                  className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                >
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/order?category=${category.slug}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      href="/services"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Browse Catalog
                    </Link>
                    <Link
                      href="/order"
                      className="block px-4 py-2 text-primary-600 hover:bg-primary-50 font-semibold"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      Order Services
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/order" className="text-gray-700 hover:text-primary-600 font-medium">
              Order
            </Link>
            <Link href="/track" className="text-gray-700 hover:text-primary-600 font-medium">
              Track
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium">
              Contact
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  <span>{(user as User).name || 'User'}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

          {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="mb-2">
              <button
                className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
              >
                <span>Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>
                  {isServicesOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/order?category=${category.slug}`}
                      className="block py-2 text-gray-600 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    className="block py-2 text-gray-600 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse Catalog
                  </Link>
                  <Link
                    href="/order"
                    className="block py-2 text-primary-600 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Order Services
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin"
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
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
                  href="/register"
                  className="block py-2 text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

