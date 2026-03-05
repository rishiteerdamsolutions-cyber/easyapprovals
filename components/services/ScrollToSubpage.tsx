'use client';

import { useEffect } from 'react';

interface ScrollToSubpageProps {
  subpage?: string;
}

export default function ScrollToSubpage({ subpage }: ScrollToSubpageProps) {
  useEffect(() => {
    if (!subpage) return;
    const el = document.getElementById(subpage);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [subpage]);

  return null;
}
