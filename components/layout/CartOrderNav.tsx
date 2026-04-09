'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, RefreshCw, Loader2 } from 'lucide-react';
import {
  loadCartFromStorage,
  shouldShowCartPriceUpdatePrompt,
  refreshCartPricingFromServer,
  markPricingConfirmedThisSession,
  persistCart,
  CART_CHANGE_EVENT,
} from '@/lib/cart-pricing';

const iconNavBtnClass =
  'group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

const navTooltipClass =
  'pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100';

type CartOrderNavProps = {
  /** When true, render a full-width row (e.g. mobile menu). */
  layout?: 'inline' | 'stacked';
  onNavigate?: () => void;
};

export default function CartOrderNav({ layout = 'inline', onNavigate }: CartOrderNavProps) {
  const [cartCount, setCartCount] = useState(0);
  const [showUpdate, setShowUpdate] = useState(false);
  const [busy, setBusy] = useState(false);

  const sync = useCallback(() => {
    const items = loadCartFromStorage();
    setCartCount(items.length);
    setShowUpdate(shouldShowCartPriceUpdatePrompt(items.length > 0));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(CART_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const handleUpdateNow = async () => {
    const items = loadCartFromStorage();
    if (items.length === 0) return;
    setBusy(true);
    try {
      const { cart: next, errors } = await refreshCartPricingFromServer(items);
      persistCart(next);
      markPricingConfirmedThisSession();
      sync();
      if (errors.length) {
        alert(errors.join('\n'));
      }
    } finally {
      setBusy(false);
    }
  };

  if (layout === 'stacked') {
    return (
      <div className="space-y-2">
        <Link
          href="/order"
          className="flex items-center justify-between py-2 text-gray-700 hover:text-primary-600 font-medium"
          onClick={onNavigate}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
            Order
          </span>
          {cartCount > 0 ? (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
              {cartCount}
            </span>
          ) : null}
        </Link>
        {showUpdate && (
          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
            Update cart prices
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href="/order" className={`${iconNavBtnClass} relative`} aria-label="Order services">
        <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
        {cartCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        ) : null}
        <span className={navTooltipClass} role="tooltip">
          Order{cartCount > 0 ? ` (${cartCount})` : ''}
        </span>
      </Link>
      {showUpdate ? (
        <button
          type="button"
          onClick={handleUpdateNow}
          disabled={busy}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
          title="Refresh cart with current website prices"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden /> : null}
          {!busy ? <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          Update now
        </button>
      ) : null}
    </div>
  );
}
