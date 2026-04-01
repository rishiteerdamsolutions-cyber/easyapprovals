'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  getIntakeQuestionsForSlug,
  areIntakeQuestionsAnswered,
  isIntakeCompleteForItem,
} from '@/lib/order-intake-questions';
import { ShoppingCart, Loader2 } from 'lucide-react';

const CART_STORAGE_KEY = 'easyapproval_cart';
const INTAKE_STORAGE_KEY = 'easyapproval_cart_intake';

interface CartItem {
  _id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  price: number;
  qty: number;
  total: number;
  professionalFee?: number;
  isQuoteService?: boolean;
  serviceSlug: string;
}

function normalizeCartItem(raw: Record<string, unknown>): CartItem {
  const serviceId = String(raw.serviceId ?? raw._id ?? '');
  const qty = Math.max(1, Number(raw.qty) || 1);
  const price = Number(raw.price) || 0;
  const slug = typeof raw.serviceSlug === 'string' && raw.serviceSlug.trim() ? raw.serviceSlug.trim() : 'unknown';
  return {
    _id: String(raw._id ?? serviceId),
    serviceId,
    serviceName: String(raw.serviceName ?? ''),
    categoryName: String(raw.categoryName ?? ''),
    price,
    qty,
    total: Number(raw.total) || price * qty,
    professionalFee: raw.professionalFee != null ? Number(raw.professionalFee) : undefined,
    isQuoteService: raw.isQuoteService === true,
    serviceSlug: slug,
  };
}

function loadCartNormalized(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const arr = stored ? JSON.parse(stored) : [];
    return Array.isArray(arr) ? arr.map((r) => normalizeCartItem(r as Record<string, unknown>)) : [];
  } catch {
    return [];
  }
}

function loadIntakeRaw(): {
  answers: Record<string, Record<string, string>>;
  notes: Record<string, string>;
} {
  if (typeof window === 'undefined') return { answers: {}, notes: {} };
  try {
    const stored = localStorage.getItem(INTAKE_STORAGE_KEY);
    if (!stored) return { answers: {}, notes: {} };
    const p = JSON.parse(stored) as { answers?: unknown; notes?: unknown };
    return {
      answers: p && typeof p.answers === 'object' && p.answers ? (p.answers as Record<string, Record<string, string>>) : {},
      notes: p && typeof p.notes === 'object' && p.notes ? (p.notes as Record<string, string>) : {},
    };
  } catch {
    return { answers: {}, notes: {} };
  }
}

function pickIntakeForCart(
  cartItems: CartItem[],
  answers: Record<string, Record<string, string>>,
  notes: Record<string, string>
) {
  const ids = new Set(cartItems.map((c) => c.serviceId));
  const na: Record<string, Record<string, string>> = {};
  const nn: Record<string, string> = {};
  for (const id of ids) {
    if (answers[id]) na[id] = answers[id];
    if (Object.prototype.hasOwnProperty.call(notes, id)) nn[id] = notes[id];
  }
  return { answers: na, notes: nn };
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
  professionalFee?: number;
  serviceCharge?: number;
  categoryId: { name: string; slug: string };
  isExtraService?: boolean;
}

function OrderSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const addServiceId = searchParams.get('addService');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, Record<string, string>>>({});
  const [intakeNotes, setIntakeNotes] = useState<Record<string, string>>({});
  const [intakeReady, setIntakeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showRequestService, setShowRequestService] = useState(false);
  const [requestingService, setRequestingService] = useState(false);

  const saveCart = useCallback((items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, []);

  useEffect(() => {
    const ids = new Set(cart.map((c) => c.serviceId));
    setIntakeAnswers((prev) => {
      const next: Record<string, Record<string, string>> = {};
      for (const id of ids) {
        if (prev[id]) next[id] = prev[id];
      }
      return next;
    });
    setIntakeNotes((prev) => {
      const next: Record<string, string> = {};
      for (const id of ids) {
        if (Object.prototype.hasOwnProperty.call(prev, id)) next[id] = prev[id];
      }
      return next;
    });
  }, [cart]);

  useEffect(() => {
    if (typeof window === 'undefined' || !intakeReady) return;
    localStorage.setItem(
      INTAKE_STORAGE_KEY,
      JSON.stringify({ answers: intakeAnswers, notes: intakeNotes })
    );
  }, [intakeAnswers, intakeNotes, intakeReady]);

  useEffect(() => {
    const items = loadCartNormalized();
    setCart(items);
    const raw = loadIntakeRaw();
    const picked = pickIntakeForCart(items, raw.answers, raw.notes);
    setIntakeAnswers(picked.answers);
    setIntakeNotes(picked.notes);
    setIntakeReady(true);
  }, []);

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

  // Add service from Get Started link (addService query param)
  useEffect(() => {
    if (!addServiceId || categories.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/services/${addServiceId}`);
        if (!res.ok || cancelled) return;
        const service = await res.json();
        const sid = String(service._id);
        setCart((prev) => {
          const existing = prev.some((c) => c.serviceId === sid);
          if (existing) return prev;
          const categoryName = typeof service.categoryId === 'object' ? service.categoryId?.name || '' : '';
          const pf = service.professionalFee ?? service.serviceCharge ?? 0;
          const price = Number(service.price) || 0;
          const item: CartItem = {
            _id: sid,
            serviceId: sid,
            serviceName: service.name,
            categoryName,
            price,
            qty: 1,
            total: price,
            professionalFee: pf,
            isQuoteService: service.isExtraService === true,
            serviceSlug: typeof service.slug === 'string' && service.slug ? service.slug : 'unknown',
          };
          const next = [...prev, item];
          if (typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          }
          return next;
        });
        if (service.categoryId?._id || service.categoryId) {
          const catId = typeof service.categoryId === 'object' ? service.categoryId._id : service.categoryId;
          if (catId) setSelectedCategoryId(catId);
        }
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) router.replace('/order' + (categorySlug ? `?category=${categorySlug}` : ''));
    })();
    return () => { cancelled = true; };
  }, [addServiceId, categories.length, categorySlug, router]);

  const toggleService = (service: Service) => {
    const existing = cart.find((c) => c.serviceId === service._id);
    const categoryName = typeof service.categoryId === 'object' ? service.categoryId?.name || '' : '';
    if (existing) {
      const next = cart.filter((c) => c.serviceId !== service._id);
      setCart(next);
      saveCart(next);
    } else {
      const pf = service.professionalFee ?? service.serviceCharge ?? 0;
      const item: CartItem = {
        _id: service._id,
        serviceId: service._id,
        serviceName: service.name,
        categoryName,
        price: service.price,
        qty: 1,
        total: service.price,
        professionalFee: pf,
        isQuoteService: service.isExtraService === true,
        serviceSlug: service.slug || 'unknown',
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
      const pf = c.professionalFee ?? 0;
      return { ...c, qty: newQty, total: c.price * newQty, professionalFee: pf };
    });
    setCart(next);
    saveCart(next);
  };

  const isInCart = (serviceId: string) => cart.some((c) => c.serviceId === serviceId);
  const getCartQty = (serviceId: string) => cart.find((c) => c.serviceId === serviceId)?.qty ?? 0;

  const isAnyOther = (s: { slug?: string; name?: string }) =>
    s?.slug === 'any-other' || s?.name === 'Any Other';

  const isQuoteService = (s: { slug?: string; name?: string; isExtraService?: boolean }) =>
    isAnyOther(s) || s?.isExtraService === true;

  const cartItemIsQuote = (c: CartItem) =>
    isQuoteService({ slug: c.serviceSlug, name: c.serviceName, isExtraService: c.isQuoteService });

  const cartWithoutAnyOther = cart.filter((c) => !cartItemIsQuote(c));
  const quoteCartItems = cart.filter((c) => cartItemIsQuote(c));
  const grandTotal = cartWithoutAnyOther.reduce((sum, c) => sum + c.total, 0);

  const paidIntakeComplete =
    cartWithoutAnyOther.length > 0 &&
    cartWithoutAnyOther.every((c) =>
      isIntakeCompleteForItem(c.serviceSlug, intakeAnswers[c.serviceId] || {}, intakeNotes[c.serviceId] || '')
    );

  const quoteIntakeComplete =
    quoteCartItems.length > 0 &&
    quoteCartItems.every((c) =>
      isIntakeCompleteForItem(c.serviceSlug, intakeAnswers[c.serviceId] || {}, intakeNotes[c.serviceId] || '')
    );

  const buildQuoteRequestMessage = () =>
    quoteCartItems
      .map((c) => {
        const qs = getIntakeQuestionsForSlug(c.serviceSlug);
        const ans = intakeAnswers[c.serviceId] || {};
        const lines = qs.map((q) => `${q.label}: ${(ans[q.id] || '').trim()}`);
        const note = (intakeNotes[c.serviceId] || '').trim();
        return [`Service: ${c.serviceName} (${c.categoryName})`, ...lines, '', 'Additional details:', note].join('\n');
      })
      .join('\n\n---\n\n');

  const setIntakeAnswer = (serviceId: string, questionId: string, value: string) => {
    setIntakeAnswers((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] || {}), [questionId]: value },
    }));
  };

  const setIntakeNote = (serviceId: string, value: string) => {
    setIntakeNotes((prev) => ({ ...prev, [serviceId]: value }));
  };

  const handleRequestService = async () => {
    if (!quoteIntakeComplete) {
      alert('Please answer all questions and describe your requirement for each quote item.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in Name, Email and Phone');
      return;
    }
    const message = buildQuoteRequestMessage();
    setRequestingService(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          subject: 'Custom / quote service request',
          message,
        }),
      });
      if (!res.ok) throw new Error('Failed to send request');
      setShowRequestService(false);
      const quoteIds = new Set(quoteCartItems.map((c) => c.serviceId));
      setCart((prev) => {
        const next = prev.filter((c) => !quoteIds.has(c.serviceId));
        if (typeof window !== 'undefined') {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
      setIntakeAnswers((prev) => {
        const next = { ...prev };
        quoteIds.forEach((id) => delete next[id]);
        return next;
      });
      setIntakeNotes((prev) => {
        const next = { ...prev };
        quoteIds.forEach((id) => delete next[id]);
        return next;
      });
      alert("We've received your request. We'll get back to you with a quote shortly.");
    } catch (e) {
      alert((e as Error).message || 'Failed to send request');
    } finally {
      setRequestingService(false);
    }
  };

  const handleGenerateOrder = async () => {
    const toOrder = cart.filter((c) => !cartItemIsQuote(c));
    if (toOrder.length === 0) {
      alert('Please add at least one paid service to create an order.');
      return;
    }
    if (!paidIntakeComplete) {
      alert('Please answer all questions and describe your requirement for each service in your cart.');
      return;
    }
    const orderTotal = toOrder.reduce((sum, c) => sum + (c.total || 0), 0);
    if (orderTotal <= 0) {
      alert('Your cart total must be greater than zero. Please add a paid service.');
      return;
    }
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
          services: toOrder.map((c) => {
            const qs = getIntakeQuestionsForSlug(c.serviceSlug);
            const ans = intakeAnswers[c.serviceId] || {};
            return {
              serviceId: String(c.serviceId),
              serviceName: c.serviceName,
              categoryName: c.categoryName,
              price: c.price,
              qty: c.qty,
              total: c.total,
              professionalFee: (c.professionalFee ?? 0) * c.qty,
              intakeAnswers: qs.map((q) => ({
                questionId: q.id,
                question: q.label,
                answer: (ans[q.id] || '').trim(),
              })),
              intakeCustomerNote: (intakeNotes[c.serviceId] || '').trim(),
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      const paidIds = new Set(toOrder.map((c) => c.serviceId));
      const remaining = cart.filter((c) => !paidIds.has(c.serviceId));
      setIntakeAnswers((prev) => {
        const next = { ...prev };
        paidIds.forEach((id) => delete next[id]);
        return next;
      });
      setIntakeNotes((prev) => {
        const next = { ...prev };
        paidIds.forEach((id) => delete next[id]);
        return next;
      });
      if (remaining.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(remaining));
        setCart(remaining);
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        setCart([]);
      }
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
                            <div className="mt-2 text-primary-600 font-bold">
                              {isQuoteService(service) ? 'Contact us' : formatCurrency(service.price)}
                            </div>
                          </div>
                        </div>
                        {inCart && !isQuoteService(service) && (
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
                  <div className="space-y-6 mb-4 max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const slug = item.serviceSlug;
                      const qs = getIntakeQuestionsForSlug(slug);
                      const ans = intakeAnswers[item.serviceId] || {};
                      const note = intakeNotes[item.serviceId] || '';
                      const questionsDone = areIntakeQuestionsAnswered(slug, ans);
                      return (
                        <div key={item.serviceId} className="border border-gray-200 rounded-lg p-3 text-sm">
                          <div className="flex justify-between gap-2 font-medium text-gray-900 mb-2">
                            <span className="truncate">{item.serviceName}</span>
                            <span className="text-primary-600 shrink-0">
                              {cartItemIsQuote(item) ? 'Quote' : `${item.qty} × ${formatCurrency(item.price)}`}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Questions for your CA</p>
                            {qs.map((q) => (
                              <label key={q.id} className="block">
                                <span className="text-xs text-gray-600">{q.label}</span>
                                <textarea
                                  value={ans[q.id] || ''}
                                  onChange={(e) => setIntakeAnswer(item.serviceId, q.id, e.target.value)}
                                  rows={2}
                                  className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                                />
                              </label>
                            ))}
                          </div>
                          {questionsDone && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-700">Describe your requirement *</label>
                              <textarea
                                value={note}
                                onChange={(e) => setIntakeNote(item.serviceId, e.target.value)}
                                placeholder="Anything else the CA should know (no minimum length)"
                                rows={3}
                                className="mt-1 w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total</span>
                      <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  {quoteCartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowRequestService(true)}
                      disabled={!quoteIntakeComplete}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    >
                      Request service
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCheckout(true)}
                    disabled={cartWithoutAnyOther.length === 0 || !paidIntakeComplete}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Request service modal (for Any Other) */}
        {showRequestService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request Custom Service</h2>
              <p className="text-sm text-gray-600 mb-4">We&apos;ll get back to you with a quote.</p>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What we will send</label>
                  <pre className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {buildQuoteRequestMessage()}
                  </pre>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestService(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestService}
                  disabled={
                    requestingService ||
                    !quoteIntakeComplete ||
                    !customerName.trim() ||
                    !customerEmail.trim() ||
                    !customerPhone.trim()
                  }
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {requestingService ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

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
