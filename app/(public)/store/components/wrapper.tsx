'use client';

import * as React from 'react';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { StoreClientWishlistSheet } from '@/app/(public)/store/components/sheets/wishlist-sheet';

export function StoreClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    state: {
      isWishlistSheetOpen,
    },
    closeWishlistSheet,
  } = useStoreClient();

  return (
    <>
      {children}
      <StoreClientWishlistSheet
        open={isWishlistSheetOpen}
        onOpenChange={closeWishlistSheet}
      />
    </>
  );
}
