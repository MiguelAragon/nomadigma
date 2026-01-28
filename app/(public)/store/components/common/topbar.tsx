'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { Heart, Search, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStoreClient } from '@/app/(public)/store/components/context';

export function StoreClientTopbar() {
  const pathname = usePathname();
  const { showWishlistSheet } = useStoreClient();

  return (
    <>
      <div className="flex items-center gap-1">
        {!pathname.includes('store-client/home') &&
          !pathname.includes('store-client/wishlist') &&
          !pathname.includes('store-client/search') &&
          !pathname.includes('store-client/search-results-list') &&
          !pathname.includes('store-client/product-details') && (
            <div className="relative lg:w-[240px] me-3">
              <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-2" />
              <Input type="text" className="px-7" placeholder="Search shop" />
              <Badge
                className="absolute top-1/2 -translate-y-1/2 end-2 gap-1"
                appearance="light"
                size="sm"
              >
                ⌘ K
              </Badge>
            </div>
          )}

        <UserDropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="lg"
              mode="icon"
              shape="circle"
              className="hover:text-primary"
            >
              <UserCircle className="size-5!" />
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="lg"
          mode="icon"
          shape="circle"
          onClick={showWishlistSheet}
          className="hover:text-primary"
        >
          <Heart className="size-5!" />
        </Button>
      </div>
    </>
  );
}
