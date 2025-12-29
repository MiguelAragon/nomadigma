'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page view con información adicional
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
    });

    // Event adicional con más información
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: document.referrer,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      user_agent: navigator.userAgent,
    });
  }, [pathname, searchParams]);

  return null;
}

