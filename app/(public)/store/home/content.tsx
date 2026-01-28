'use client';

import {
  Categories,
  Deals,
  FeaturedProducts,
  Info,
  NewArrivals,
  PopularSneakers,
  Promotions,
  Search,
  SpecialOffers,
} from './components';

export function StoreClientContent() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Search />
      {/* <Info /> */}
      <Categories />
      {/* <FeaturedProducts /> */}
      {/* <Promotions /> */}
      {/* <NewArrivals /> */}
      {/* <PopularSneakers /> */}
      <Deals />
    </div>
  );
}
