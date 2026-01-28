'use client';

import { useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ICard2Props {
  bgColor: string;
  borderColor: string;
  title: string;
  total: string;
  logo: string;
  productSlug?: string;
}

export function Card2({
  bgColor,
  borderColor,
  title,
  total,
  logo,
  productSlug,
}: ICard2Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (productSlug) {
      window.location.href = `/store/products/${productSlug}`;
    }
  };

  return (
    <Card 
      className={`h-full ${bgColor} ${borderColor} overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardContent className="flex flex-col items-center justify-center px-5 pb-0">
        <div className="mb-3.5">
          <Badge size="sm" variant="destructive" className="uppercase">
            save 25%
          </Badge>
        </div>

        <span className="text-base font-medium text-mono mb-3 group-hover:text-primary transition-colors duration-300">{title}</span>
        <span className="text-sm font-medium text-mono mb-3">{total}</span>

        <div className="relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}
          {!imageError && (
            <img
              src={toAbsoluteUrl(`/media/store/client/600x600/${logo}`)}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`size-48 group-hover:scale-110 transition-transform duration-500 ease-out object-cover ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              alt="image"
            />
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-xs">No image</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
