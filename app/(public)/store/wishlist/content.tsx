'use client';

import { useState } from 'react';
import { StoreClientWishlistSheet } from '@/app/(public)/store/components/sheets/wishlist-sheet';
import { SearchResults } from '@/app/(public)/store/search-results-grid/components/search-results';

export function WishlistContent() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <SearchResults mode="card" />
      <StoreClientWishlistSheet
        open={open}
        onOpenChange={() => setOpen(false)}
      />
    </>
  );
}
