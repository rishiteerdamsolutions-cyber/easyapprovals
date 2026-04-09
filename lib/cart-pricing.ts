import { getCheckoutUnitTotal } from '@/lib/service-pricing-display';

export const CART_STORAGE_KEY = 'easyapproval_cart';

/** Session: user clicked “Update now” and cart was refreshed from the server. */
export const CART_PRICING_CONFIRMED_KEY = 'easyapproval_cart_pricing_confirmed';
/** Session: user added, removed, or changed qty this session (carried-over cart alone does not set this). */
export const CART_MUTATED_SESSION_KEY = 'easyapproval_cart_mutated_session';

export const CART_CHANGE_EVENT = 'easyapproval-cart-change';

export interface CartLineForPricing {
  _id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  price: number;
  lineUnitTotal: number;
  qty: number;
  total: number;
  professionalFee?: number;
  isQuoteService?: boolean;
  serviceSlug: string;
}

export function normalizeCartLine(raw: Record<string, unknown>): CartLineForPricing {
  const serviceId = String(raw.serviceId ?? raw._id ?? '');
  const qty = Math.max(1, Number(raw.qty) || 1);
  const price = Number(raw.price) || 0;
  const lineUnitTotal =
    raw.lineUnitTotal != null && !Number.isNaN(Number(raw.lineUnitTotal))
      ? Number(raw.lineUnitTotal)
      : price;
  const slug =
    typeof raw.serviceSlug === 'string' && raw.serviceSlug.trim()
      ? raw.serviceSlug.trim()
      : 'unknown';
  const total = Number(raw.total) || lineUnitTotal * qty;
  return {
    _id: String(raw._id ?? serviceId),
    serviceId,
    serviceName: String(raw.serviceName ?? ''),
    categoryName: String(raw.categoryName ?? ''),
    price,
    lineUnitTotal,
    qty,
    total,
    professionalFee: raw.professionalFee != null ? Number(raw.professionalFee) : undefined,
    isQuoteService: raw.isQuoteService === true,
    serviceSlug: slug,
  };
}

export function loadCartFromStorage(): CartLineForPricing[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const arr = stored ? JSON.parse(stored) : [];
    return Array.isArray(arr) ? arr.map((r) => normalizeCartLine(r as Record<string, unknown>)) : [];
  } catch {
    return [];
  }
}

export function readSessionFlag(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(key) === '1';
}

export function setSessionFlag(key: string, value = '1') {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, value);
}

export function markCartMutatedThisSession() {
  setSessionFlag(CART_MUTATED_SESSION_KEY);
}

export function markPricingConfirmedThisSession() {
  setSessionFlag(CART_PRICING_CONFIRMED_KEY);
}

/** Block checkout when cart is non-empty and user has not refreshed prices this session and has not changed the cart this session. */
export function mustRefreshCartBeforeCheckout(hasItems: boolean): boolean {
  if (!hasItems) return false;
  if (readSessionFlag(CART_PRICING_CONFIRMED_KEY)) return false;
  if (readSessionFlag(CART_MUTATED_SESSION_KEY)) return false;
  return true;
}

/** Show “Update” prompt whenever there is a cart and prices were not confirmed this session. */
export function shouldShowCartPriceUpdatePrompt(hasItems: boolean): boolean {
  if (!hasItems) return false;
  return !readSessionFlag(CART_PRICING_CONFIRMED_KEY);
}

export function dispatchCartChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

type ApiService = {
  _id?: string;
  name?: string;
  slug?: string;
  price?: number;
  professionalFee?: number;
  serviceCharge?: number;
  governmentFee?: number;
  gstPercent?: number;
  additionalCharges?: { label?: string; amount?: number }[];
  isExtraService?: boolean;
  categoryId?: { name?: string; slug?: string } | string;
};

function lineFromApi(service: ApiService, prev: CartLineForPricing): CartLineForPricing {
  const sid = String(service._id ?? prev.serviceId);
  const categoryName =
    typeof service.categoryId === 'object' && service.categoryId
      ? service.categoryId.name || prev.categoryName
      : prev.categoryName;
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
  const qty = prev.qty;
  return {
    _id: sid,
    serviceId: sid,
    serviceName: typeof service.name === 'string' ? service.name : prev.serviceName,
    categoryName,
    price,
    lineUnitTotal,
    qty,
    total: lineUnitTotal * qty,
    professionalFee: pf,
    isQuoteService: service.isExtraService === true,
    serviceSlug: typeof service.slug === 'string' && service.slug ? service.slug : prev.serviceSlug,
  };
}

/** Re-fetch each line from the API and rebuild totals. Drops lines that 404. */
export async function refreshCartPricingFromServer(
  items: CartLineForPricing[]
): Promise<{ cart: CartLineForPricing[]; errors: string[] }> {
  const next: CartLineForPricing[] = [];
  const errors: string[] = [];
  for (const prev of items) {
    try {
      const res = await fetch(`/api/services/${prev.serviceId}`);
      if (!res.ok) {
        if (res.status === 404) {
          errors.push(`${prev.serviceName || 'Service'} is no longer available and was removed from your cart.`);
          continue;
        }
        errors.push(`Could not refresh ${prev.serviceName || 'a service'}.`);
        next.push(prev);
        continue;
      }
      const service = (await res.json()) as ApiService;
      next.push(lineFromApi(service, prev));
    } catch {
      errors.push(`Could not refresh ${prev.serviceName || 'a service'}.`);
      next.push(prev);
    }
  }
  return { cart: next, errors };
}

export function persistCart(items: CartLineForPricing[]) {
  if (typeof window === 'undefined') return;
  if (items.length === 0) {
    localStorage.removeItem(CART_STORAGE_KEY);
  } else {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
  dispatchCartChanged();
}
