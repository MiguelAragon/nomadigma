'use client';

import { useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Card1Props {
  productSlug?: string;
}

export function Card1({ productSlug }: Card1Props = {} as Card1Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (productSlug) {
      window.location.href = `/store/products/${productSlug}`;
    }
  };

  return (
    <Card 
      className="bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-950 h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="flex items-center flex-wrap sm:flex-nowrap justify-between gap-5 lg:gap-9 px-7.5 pb-0">
        <div className="flex flex-col">
          <div className="mb-3">
            <Badge size="sm" variant="destructive" className="uppercase">
              save 25%
            </Badge>
          </div>

          <h3 className="text-[26px] font-semibold text-mono mb-1 group-hover:text-primary transition-colors duration-300">
            Nike Air Max 270
          </h3>

          <span className="text-sm font-normal text-foreground mb-5 leading-5.5">
            The Melodic Monster of Sonic Delights and Harmonious Rhythms
          </span>

          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-mono">$140.00</span>
          </div>
        </div>

        <div className="relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}
          {!imageError && (
            <img
              src={toAbsoluteUrl('/media/store/client/600x600/16.png')}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`h-[250px] group-hover:scale-110 transition-transform duration-500 ease-out object-cover ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              alt="image"
            />
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground">No image available</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
