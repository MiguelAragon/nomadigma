'use client';

import { useState } from 'react';
import { StoreClientProductDetailsSheet } from '@/app/(public)/store/components/sheets/product-details-sheet';
import { SearchResults } from '@/app/(public)/store/search-results-grid/components/search-results';

export function ProductDetailsContent() {
  const [open, setOpen] = useState(true);
  const [selectedProductId] = useState('123');

  const handleAddToCart = ({ productId }: { productId: string }) => {
    console.log('Added to cart:', productId);
  };

  return (
    <>
      <SearchResults mode="card" />
      <StoreClientProductDetailsSheet
        open={open}
        onOpenChange={() => setOpen(false)}
        productId={selectedProductId}
        addToCart={handleAddToCart}
      />
    </>
  );
}
