'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  getIntakeQuestionsForSlug,
  isIntakeCompleteForItem,
  formatIntakeForLeadMessage,
} from '@/lib/order-intake-questions';
import OrderIntakeModal from '@/components/order/OrderIntakeModal';
import { getCheckoutUnitTotal } from '@/lib/service-pricing-display';
import {
  loadCartFromStorage,
  persistCart,
  markCartMutatedThisSession,
  markPricingConfirmedThisSession,
  mustRefreshCartBeforeCheckout,
  shouldShowCartPriceUpdatePrompt,
  refreshCartPricingFromServer,
  CART_CHANGE_EVENT,
  type CartLineForPricing,
} from '@/lib/cart-pricing';
import { ShoppingCart, Loader2, RefreshCw } from 'lucide-react';

const INTAKE_STORAGE_KEY = 'easyapproval_cart_intake';
const LEAD_SENT_STORAGE_KEY = 'easyapproval_cart_lead_sent';

type CartItem = CartLineForPricing;

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
  governmentFee?: number;
  gstPercent?: number;
  additionalCharges?: { label?: string; amount?: number }[];
  categoryId: { name: string; slug: string };
  isExtraService?: boolean;
}

function listUnitTotalForService(service: Service): number {
  return getCheckoutUnitTotal({
    price: Number(service.price) || 0,
    serviceCharge: Number(service.serviceCharge) || 0,
    governmentFee: Number(service.governmentFee) || 0,
    professionalFee: Number(service.professionalFee) || 0,
    gstPercent: Number(service.gstPercent) || 18,
    additionalCharges: service.additionalCharges,
    isExtraService: service.isExtraService === true,
  }).unitTotal;
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
  const [intakeModalServiceId, setIntakeModalServiceId] = useState<string | null>(null);
  const [intakeModalSubmitting, setIntakeModalSubmitting] = useState(false);
  const [leadSentMap, setLeadSentMap] = useState<Record<string, boolean>>({});
  const [pricingRefreshing, setPricingRefreshing] = useState(false);
  const cartHydratedRef = useRef(false);

  const saveCart = useCallback((items: CartItem[]) => {
    persistCart(items);
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
    if (cartHydratedRef.current) {
      setLeadSentMap((prev) => {
        if (ids.size === 0) return {};
        const next: Record<string, boolean> = {};
        for (const id of ids) {
          if (prev[id]) next[id] = true;
        }
        return next;
      });
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window === 'undefined' || !intakeReady) return;
    localStorage.setItem(
      INTAKE_STORAGE_KEY,
      JSON.stringify({ answers: intakeAnswers, notes: intakeNotes })
    );
  }, [intakeAnswers, intakeNotes, intakeReady]);

  useEffect(() => {
    if (typeof window === 'undefined' || !intakeReady) return;
    localStorage.setItem(LEAD_SENT_STORAGE_KEY, JSON.stringify(leadSentMap));
  }, [leadSentMap, intakeReady]);

  useEffect(() => {
    const items = loadCartFromStorage();
    setCart(items);
    const raw = loadIntakeRaw();
    const picked = pickIntakeForCart(items, raw.answers, raw.notes);
    setIntakeAnswers(picked.answers);
    setIntakeNotes(picked.notes);
    try {
      const leadRaw = localStorage.getItem(LEAD_SENT_STORAGE_KEY);
      const leadParsed = leadRaw ? (JSON.parse(leadRaw) as Record<string, boolean>) : {};
      const leadsInit: Record<string, boolean> = {};
      for (const c of items) {
        if (leadParsed[c.serviceId]) leadsInit[c.serviceId] = true;
      }
      setLeadSentMap(leadsInit);
    } catch {
      setLeadSentMap({});
    }
    cartHydratedRef.current = true;
    setIntakeReady(true);
  }, []);

  useEffect(() => {
    function onCartExternalChange() {
      setCart(loadCartFromStorage());
    }
    window.addEventListener(CART_CHANGE_EVENT, onCartExternalChange);
    window.addEventListener('storage', onCartExternalChange);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, onCartExternalChange);
      window.removeEventListener('storage', onCartExternalChange);
    };
  }, []);

  useEffect(() => {
    if (!intakeModalServiceId) return;
    if (!cart.some((c) => c.serviceId === intakeModalServiceId)) {
      setIntakeModalServiceId(null);
    }
  }, [cart, intakeModalServiceId]);

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
          const lineUnitTotal = getCheckoutUnitTotal({
            price: Number(service.price) || 0,
            serviceCharge: Number(service.serviceCharge) || 0,
            governmentFee: Number(service.governmentFee) || 0,
            professionalFee: Number(service.professionalFee) || 0,
            gstPercent: Number(service.gstPercent) || 18,
            additionalCharges: service.additionalCharges,
            isExtraService: service.isExtraService === true,
          }).unitTotal;
          const item: CartItem = {
            _id: sid,
            serviceId: sid,
            serviceName: service.name,
            categoryName,
            price,
            lineUnitTotal,
            qty: 1,
            total: lineUnitTotal,
            professionalFee: pf,
            isQuoteService: service.isExtraService === true,
            serviceSlug: typeof service.slug === 'string' && service.slug ? service.slug : 'unknown',
          };
          const next = [...prev, item];
          persistCart(next);
          markCartMutatedThisSession();
          setIntakeModalServiceId(sid);
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
      setIntakeModalServiceId((prev) => (prev === service._id ? null : prev));
      const next = cart.filter((c) => c.serviceId !== service._id);
      setCart(next);
      saveCart(next);
      markCartMutatedThisSession();
    } else {
      const pf = service.professionalFee ?? service.serviceCharge ?? 0;
      const lineUnitTotal = getCheckoutUnitTotal({
        price: Number(service.price) || 0,
        serviceCharge: Number(service.serviceCharge) || 0,
        governmentFee: Number(service.governmentFee) || 0,
        professionalFee: Number(service.professionalFee) || 0,
        gstPercent: Number(service.gstPercent) || 18,
        additionalCharges: service.additionalCharges,
        isExtraService: service.isExtraService === true,
      }).unitTotal;
      const item: CartItem = {
        _id: service._id,
        serviceId: service._id,
        serviceName: service.name,
        categoryName,
        price: service.price,
        lineUnitTotal,
        qty: 1,
        total: lineUnitTotal,
        professionalFee: pf,
        isQuoteService: service.isExtraService === true,
        serviceSlug: service.slug || 'unknown',
      };
      const next = [...cart, item];
      setCart(next);
      saveCart(next);
      markCartMutatedThisSession();
      setIntakeModalServiceId(service._id);
    }
  };

  const updateQty = (serviceId: string, delta: number) => {
    const next = cart.map((c) => {
      if (c.serviceId !== serviceId) return c;
      const newQty = Math.max(1, c.qty + delta);
      const pf = c.professionalFee ?? 0;
      const unit = c.lineUnitTotal ?? c.price;
      return { ...c, qty: newQty, total: unit * newQty, professionalFee: pf };
    });
    setCart(next);
    saveCart(next);
    markCartMutatedThisSession();
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
  const grandTotal = cartWithoutAnyOther.reduce((sum, c) => sum + c.total, 0);

  const showPriceUpdatePrompt = shouldShowCartPriceUpdatePrompt(cart.length > 0);
  const checkoutBlockedByStaleCart = mustRefreshCartBeforeCheckout(cartWithoutAnyOther.length > 0);

  const paidIntakeComplete =
    cartWithoutAnyOther.length > 0 &&
    cartWithoutAnyOther.every((c) =>
      isIntakeCompleteForItem(
        c.serviceSlug,
        intakeAnswers[c.serviceId] || {},
        intakeNotes[c.serviceId] || ''
      ) && leadSentMap[c.serviceId]
    );

  const setIntakeAnswer = (serviceId: string, questionId: string, value: string) => {
    setIntakeAnswers((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] || {}), [questionId]: value },
    }));
  };

  const setIntakeNote = (serviceId: string, value: string) => {
    setIntakeNotes((prev) => ({ ...prev, [serviceId]: value }));
  };

  const handleIntakeModalSubmit = async () => {
    const id = intakeModalServiceId;
    if (!id) return;
    const item = cart.find((c) => c.serviceId === id);
    if (!item) return;
    if (
      !isIntakeCompleteForItem(
        item.serviceSlug,
        intakeAnswers[id] || {},
        intakeNotes[id] || ''
      )
    ) {
      alert('Please answer every question and add details under “Describe your requirement”.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in Name, Email and Phone so we can follow up.');
      return;
    }
    setIntakeModalSubmitting(true);
    try {
      const message = formatIntakeForLeadMessage(
        item.serviceName,
        item.categoryName,
        item.serviceSlug,
        intakeAnswers[id] || {},
        intakeNotes[id] || ''
      );
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          subject: `Cart intake: ${item.serviceName}`,
          message,
          source: 'cart_intake',
          serviceSlug: item.serviceSlug,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to save lead');
      setLeadSentMap((prev) => ({ ...prev, [id]: true }));
      if (cartItemIsQuote(item)) {
        const next = cart.filter((c) => c.serviceId !== id);
        setCart(next);
        saveCart(next);
        markCartMutatedThisSession();
        setIntakeAnswers((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
        setIntakeNotes((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
      }
      setIntakeModalServiceId(null);
    } catch (e) {
      alert((e as Error).message || 'Failed to submit');
    } finally {
      setIntakeModalSubmitting(false);
    }
  };

  const handleRefreshCartPrices = async () => {
    if (cart.length === 0) return;
    setPricingRefreshing(true);
    try {
      const { cart: next, errors } = await refreshCartPricingFromServer(cart);
      setCart(next);
      persistCart(next);
      markPricingConfirmedThisSession();
      if (errors.length) {
        alert(errors.join('\n'));
      }
    } finally {
      setPricingRefreshing(false);
    }
  };

  const handleGenerateOrder = async () => {
    const toOrder = cart.filter((c) => !cartItemIsQuote(c));
    if (toOrder.length === 0) {
      alert('Please add at least one paid service to create an order.');
      return;
    }
    if (mustRefreshCartBeforeCheckout(toOrder.length > 0)) {
      alert(
        'Your cart was saved from an earlier visit. Click “Update now” below the cart (or in the header) to refresh prices from the website, then continue to checkout.'
      );
      return;
    }
    if (!paidIntakeComplete) {
      alert(
        'For each service in your cart, open “Answer questions”, fill the form, and click “Submit & send to team” so we receive your intake as a lead. Then you can generate your order.'
      );
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
      setLeadSentMap((prev) => {
        const next = { ...prev };
        paidIds.forEach((id) => delete next[id]);
        return next;
      });
      if (remaining.length > 0) {
        persistCart(remaining);
        setCart(remaining);
      } else {
        persistCart([]);
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
          {showPriceUpdatePrompt && (
            <div
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="status"
            >
              <span className="font-semibold">Price update available.</span>{' '}
              Use <span className="font-medium">Update now</span> in your cart (or the header) so your totals match
              current prices before checkout.
            </div>
          )}
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
                              {isQuoteService(service)
                                ? 'Contact us'
                                : formatCurrency(listUnitTotalForService(service))}
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
              {showPriceUpdatePrompt && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-semibold">Update available</p>
                  <p className="mt-1 text-amber-900/90">
                    Sync your cart with the latest prices on the site. Required before checkout if you continued a cart
                    from an earlier visit without adding items this time.
                  </p>
                  <button
                    type="button"
                    onClick={handleRefreshCartPrices}
                    disabled={pricingRefreshing}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    {pricingRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    )}
                    Update now
                  </button>
                </div>
              )}
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">No services selected</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4 max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const slug = item.serviceSlug;
                      const complete = isIntakeCompleteForItem(
                        slug,
                        intakeAnswers[item.serviceId] || {},
                        intakeNotes[item.serviceId] || ''
                      );
                      const sent = leadSentMap[item.serviceId];
                      const quote = cartItemIsQuote(item);
                      return (
                        <div key={item.serviceId} className="border border-gray-200 rounded-lg p-3 text-sm">
                          <div className="flex justify-between gap-2 font-medium text-gray-900">
                            <span className="truncate">{item.serviceName}</span>
                            <span className="text-primary-600 shrink-0">
                              {quote
                                ? 'Quote'
                                : `${item.qty} × ${formatCurrency(item.lineUnitTotal ?? item.price)}`}
                            </span>
                          </div>
                          {!quote && (
                            <p className="mt-2 text-xs text-gray-600">
                              {sent
                                ? 'Intake sent to team. You can edit and resubmit from the button below.'
                                : complete
                                  ? 'Answer the questions in the modal, then submit to send your details to our team.'
                                  : 'Add this service’s intake answers in the modal (opens when you add to cart).'}
                            </p>
                          )}
                          {quote && (
                            <p className="mt-2 text-xs text-amber-800">
                              Open the modal to answer questions; after submit we&apos;ll contact you with a quote.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => setIntakeModalServiceId(item.serviceId)}
                            className="mt-2 w-full py-2 rounded-lg text-xs font-semibold border border-primary-600 text-primary-700 hover:bg-primary-50"
                          >
                            {quote ? 'Answer questions & request quote' : sent ? 'View / edit intake' : 'Answer questions'}
                          </button>
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
                  <button
                    type="button"
                    onClick={() => setShowCheckout(true)}
                    disabled={
                      cartWithoutAnyOther.length === 0 || !paidIntakeComplete || checkoutBlockedByStaleCart
                    }
                    title={
                      checkoutBlockedByStaleCart
                        ? 'Refresh cart prices with Update now before checkout'
                        : undefined
                    }
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Order
                  </button>
                  {checkoutBlockedByStaleCart && (
                    <p className="mt-2 text-center text-xs text-amber-800">
                      Click <span className="font-semibold">Update now</span> above to refresh prices, then continue.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {intakeModalServiceId &&
          (() => {
            const modalItem = cart.find((c) => c.serviceId === intakeModalServiceId);
            if (!modalItem) return null;
            return (
              <OrderIntakeModal
                item={{
                  serviceId: modalItem.serviceId,
                  serviceName: modalItem.serviceName,
                  categoryName: modalItem.categoryName,
                  serviceSlug: modalItem.serviceSlug,
                }}
                questions={getIntakeQuestionsForSlug(modalItem.serviceSlug)}
                answers={intakeAnswers[modalItem.serviceId] || {}}
                note={intakeNotes[modalItem.serviceId] || ''}
                onAnswerChange={(qid, v) => setIntakeAnswer(modalItem.serviceId, qid, v)}
                onNoteChange={(v) => setIntakeNote(modalItem.serviceId, v)}
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                onCustomerNameChange={setCustomerName}
                onCustomerEmailChange={setCustomerEmail}
                onCustomerPhoneChange={setCustomerPhone}
                onSubmit={handleIntakeModalSubmit}
                onClose={() => setIntakeModalServiceId(null)}
                submitting={intakeModalSubmitting}
                isQuoteItem={cartItemIsQuote(modalItem)}
              />
            );
          })()}

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
                {checkoutBlockedByStaleCart && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Click <span className="font-semibold">Update now</span> on the order page (cart sidebar or site
                    header) to refresh prices before creating your order.
                  </p>
                )}
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
                  disabled={submitting || checkoutBlockedByStaleCart}
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
