'use client';

import { NavigationLoader } from '@/components/navigation-loader';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationLoader />
      {children}
    </>
  );
}

