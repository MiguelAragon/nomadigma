'use client';

import { useState } from 'react';
import { Search as SearchInput } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function Search() {
  const [searchInput, setSearchInput] = useState('');

  return (
    <Card className="shadow-none relative h-[200px] bg-cover bg-center bg-no-repeat mb-3.5 overflow-hidden" style={{ backgroundImage: 'url(/slides/banner.jpg)' }}>
      <div className="relative flex items-center max-w-[420px] w-[90%] mx-auto top-1/2 -translate-y-1/2 z-1">
        {/* <SearchInput
          className="absolute start-4 text-muted-foreground"
          size={18}
        /> */}

        {/* <Input
          variant="lg"
          id="search-input"
          value={searchInput}
          placeholder="Search shop"
          onChange={(e) => setSearchInput(e.target.value)}
          className="ps-9 pe-10 w-full"
        /> */}

        {/* <Badge className="absolute end-3 gap-1" variant="outline" size="sm">
          ⌘ K
        </Badge> */}
      </div>
    </Card>
  );
}
