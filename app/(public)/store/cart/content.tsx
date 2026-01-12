'use client';

import { useState } from 'react';  
import { StoreClientCartSheet } from '@/app/(public)/store/components/sheets/cart-sheet';
import { SearchResults } from '@/app/(public)/store/search-results-grid/components/search-results'; 

export function CartContent() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <SearchResults mode="card" />
      <StoreClientCartSheet
        open={open}
        onOpenChange={() => setOpen(false)}
      />
    </>
  );
}
