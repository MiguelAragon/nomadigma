'use client';

import { SearchResults } from '@/app/(public)/store/components/search-results'; 

export function CartContent() {
  return (
    <>
      <SearchResults mode="card" />
    </>
  );
}
