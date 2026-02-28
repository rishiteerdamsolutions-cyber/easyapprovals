'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Loader2 } from 'lucide-react';

const CART_STORAGE_KEY = 'easyapproval_cart';

interface CartItem {
  _id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  price: number;
  qty: number;
  total: number;
}

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
  categoryId: { name: string; slug: string };
}

function OrderSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const loadCart = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const saveCart = useCallback((items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, []);

  useEffect(() => {
    setCart(loadCart());
  }, [loadCart]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) {
            const match = categorySlug ? data.find((c: Category) => c.slug === categorySlug) : null;
            setSelectedCategoryId(match ? match._id : data[0]._id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [categorySlug]);

  useEffect(() => {
    async function fetchServices() {
      if (!selectedCategoryId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/services?categoryId=${selectedCategoryId}`);
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
    fetchServices();
  }, [selectedCategoryId]);

  const toggleService = (service: Service) => {
    const existing = cart.find((c) => c.serviceId === service._id);
    const categoryName = typeof service.categoryId === 'object' ? service.categoryId?.name || '' : '';
    if (existing) {
      const next = cart.filter((c) => c.serviceId !== service._id);
      setCart(next);
      saveCart(next);
    } else {
      const item: CartItem = {
        _id: service._id,
        serviceId: service._id,
        serviceName: service.name,
        categoryName,
        price: service.price,
        qty: 1,
        total: service.price,
      };
      const next = [...cart, item];
      setCart(next);
      saveCart(next);
    }
  };

  const updateQty = (serviceId: string, delta: number) => {
    const next = cart.map((c) => {
      if (c.serviceId !== serviceId) return c;
      const newQty = Math.max(1, c.qty + delta);
      return { ...c, qty: newQty, total: c.price * newQty };
    });
    setCart(next);
    saveCart(next);
  };

  const isInCart = (serviceId: string) => cart.some((c) => c.serviceId === serviceId);
  const getCartQty = (serviceId: string) => cart.find((c) => c.serviceId === serviceId)?.qty ?? 0;

  const grandTotal = cart.reduce((sum, c) => sum + c.total, 0);

  const handleGenerateOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in Name, Email and Phone');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          services: cart.map((c) => ({
            serviceId: c.serviceId,
            serviceName: c.serviceName,
            categoryName: c.categoryName,
            price: c.price,
            qty: c.qty,
            total: c.total,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
      router.push(`/order/${data._id}/payment`);
    } catch (e) {
      alert((e as Error).message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (categories.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Services Coming Soon</h2>
          <p className="text-gray-600 mb-6">Our service catalog is being updated. Please check back shortly or contact us for assistance.</p>
          <a href="/contact" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 inline-block mr-4">Contact Us</a>
          <a href="/" className="text-primary-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Select Services</h1>
          <p className="text-xl text-gray-600">Choose services and proceed to checkout</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Category menu */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-3">Categories</h2>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategoryId === cat._id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right: Services */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => {
                    const inCart = isInCart(service._id);
                    const qty = getCartQty(service._id);
                    const categoryName = typeof service.categoryId === 'object' && service.categoryId ? (service.categoryId as { name?: string }).name || '' : '';
                    return (
                      <div
                        key={service._id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={inCart}
                            onChange={() => toggleService({ ...service, categoryId: { name: categoryName, slug: '' } } as Service)}
                            className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                            <div className="mt-2 text-primary-600 font-bold">{formatCurrency(service.price)}</div>
                          </div>
                        </div>
                        {inCart && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(service._id, -1)}
                              className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 font-medium"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{qty}</span>
                            <button
                              onClick={() => updateQty(service._id, 1)}
                              className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 font-medium"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {services.length === 0 && !loading && (
                    <p className="text-gray-500 py-8 text-center">No services in this category.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">No services selected</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.serviceId} className="text-sm flex justify-between">
                        <span className="text-gray-700 truncate flex-1">{item.serviceName}</span>
                        <span className="text-primary-600 font-medium ml-2">
                          {item.qty} × {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total</span>
                      <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={cart.length === 0}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Checkout modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateOrder}
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
      <OrderSelectContent />
    </Suspense>
  );
}
