'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  serviceCharge?: number;
  governmentFee?: number;
  professionalFee?: number;
  gstPercent?: number;
  categoryId: { name: string; slug: string };
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const url = selectedCategory === 'all'
          ? '/api/services'
          : `/api/services?categoryId=${categories.find((c) => c.slug === selectedCategory)?._id || ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (selectedCategory === 'all' || categories.length > 0) {
      fetchServices();
    }
  }, [selectedCategory, categories]);

  const filteredServices = searchQuery
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">
            Complete compliance solutions for your business
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const sc = service.serviceCharge ?? 0;
              const gf = service.governmentFee ?? 0;
              const pf = service.professionalFee ?? 0;
              const subtotal = sc + gf + pf > 0 ? sc + gf + pf : service.price;
              const gst = Math.round(subtotal * ((service.gstPercent ?? 18) / 100));
              const total = subtotal + gst;
              return (
                <Link
                  key={service._id}
                  href={`/${service.slug}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total (incl. GST):</span>
                      <span className="font-bold text-primary-600">₹{total.toLocaleString()}</span>
                    </div>
                    {(sc > 0 || gf > 0 || pf > 0) && (
                      <p className="text-xs text-gray-500">View breakdown →</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Our service catalog is being updated. Please check back shortly.</p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-primary-600">{services.length}+</div>
            <div className="text-gray-600 mt-2">Services</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-primary-600">{categories.length}</div>
            <div className="text-gray-600 mt-2">Categories</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-primary-600">99%</div>
            <div className="text-gray-600 mt-2">Success Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-primary-600">24/7</div>
            <div className="text-gray-600 mt-2">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
