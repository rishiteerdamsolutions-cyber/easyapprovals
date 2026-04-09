'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { loadCartFromStorage, CART_CHANGE_EVENT } from '@/lib/cart-pricing';

const iconNavBtnClass =
  'group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

const navTooltipClass =
  'pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100';

type CartOrderNavProps = {
  onNavigate?: () => void;
  /** Mobile menu: text row instead of icon button. */
  variant?: 'icon' | 'mobile-row';
};

export default function CartOrderNav({ onNavigate, variant = 'icon' }: CartOrderNavProps) {
  const [cartCount, setCartCount] = useState(0);

  const sync = useCallback(() => {
    setCartCount(loadCartFromStorage().length);
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

  if (variant === 'mobile-row') {
    return (
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
    );
  }

  return (
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
  );
}
