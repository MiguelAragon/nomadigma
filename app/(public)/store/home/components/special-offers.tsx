'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card1 } from '@/app/(public)/store/home/special-offers/card1';
import { Card2 } from '@/app/(public)/store/home/special-offers/card2';
import { useTranslation } from '@/hooks/use-translation';

export function SpecialOffers() {
  const { locale } = useTranslation();
  
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-lg font-medium text-mono">{locale === 'es' ? 'Ofertas Especiales' : 'Special Offers'}</span>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mb-2">
        <div className="lg:col-span-1">
          <Card1 />
        </div>

        <div className="lg:col-span-1">
          <div className="grid sm:grid-cols-2 gap-5 items-stretch">
            <Card2
              logo='4.png'
              title='Nike Dunk Low'
              total='$110.00'
              bgColor="bg-green-50 dark:bg-green-950/30"
              borderColor="border-green-200 dark:border-green-950"
            />
            <Card2
              logo="1.png"
              title="Nike Air Force 1"
              total="$96.99"
              bgColor="bg-primary/10"
              borderColor="border-primary/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
