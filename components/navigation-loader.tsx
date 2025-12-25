'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { NavigationProgressBar } from './navigation-progress-bar';

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const previousPathnameRef = useRef(pathname);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Intercept all link clicks to show loader BEFORE navigation
    const handleLinkClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys are pressed (Ctrl/Cmd+click opens in new tab)
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);
          
          // Only for internal navigation to different routes
          if (
            url.origin === currentUrl.origin && 
            url.pathname !== currentUrl.pathname &&
            !link.hasAttribute('target') && // Don't intercept external links
            !link.hasAttribute('download') // Don't intercept download links
          ) {
            // Show loader immediately when link is clicked (before navigation)
            setIsLoading(true);
            
            // Clear any existing timeout
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
          }
        } catch (error) {
          // Invalid URL, ignore
        }
      }
    };

    // Use capture phase to intercept before default behavior
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // When pathname changes, hide loader after transition completes
    if (pathname !== previousPathnameRef.current) {
      // Pathname changed, wait a bit for smooth transition
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      previousPathnameRef.current = pathname;
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <NavigationProgressBar isLoading={isLoading} />;
}

