'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ICard3Props {
  badge?: boolean;
  logo: string;
  title: string;
  total: string;
  star: string;
  label?: string;
  sku?: string;
  category1?: string;
  category2?: string;
  badgeLabel?: string;
}

export function Card3({
  badge,
  logo,
  title,
  badgeLabel,
  sku,
  total,
  star,
  label,
  category1,
  category2,
}: ICard3Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleProductClick = () => {
    if (sku) {
      window.location.href = `/store/products/${sku}`;
    }
    // Si no hay sku, no hacer nada
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onClick={handleProductClick}
    >
      <CardContent className="flex items-center flex-wrap justify-between p-2 pe-5 gap-4.5">
        <div className="flex items-center gap-3.5">
          <Card className="flex items-center justify-center bg-accent/50 h-[70px] w-[90px] shadow-none overflow-hidden relative">
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
                className={`h-[70px] group-hover:scale-110 transition-transform duration-500 ease-out object-cover ${
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
          </Card>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 -mt-1">
              <div className="hover:text-primary text-sm font-medium text-mono leading-5.5 group-hover:text-primary transition-colors duration-300">
                {title}
              </div>

              {badge && (
                <Badge size="sm" variant="destructive" className="uppercase">
                  save {badgeLabel}%
                </Badge>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <Badge
                size="sm"
                variant="success"
                className="rounded-full gap-1"
              >
                <Star
                  className="text-white -mt-0.5"
                  style={{ fill: 'currentColor' }}
                />{' '}
                {star}
              </Badge>

              <div className="flex items-center flex-wrap gap-2 lg:gap-4">
                {sku && (
                  <span className="text-xs font-medium text-foreground">
                    {sku}
                  </span>
                )}
                <span className="text-xs font-normal text-secondary-foreground">
                  Category:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {category1}
                  </span>
                </span>
                <span className="text-xs font-normal text-secondary-foreground">
                  Category:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {category2}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-normal text-secondary-foreground line-through">
            {label}
          </span>
          <span className="text-sm font-medium text-mono">${total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
