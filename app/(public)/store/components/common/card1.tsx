'use client';

import { Fragment, useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { useStoreClient } from '@/app/(public)/store/components/context';

interface ICard1Item {
  logo: string;
  brand: string;
}
type ICard1Items = Array<ICard1Item>;

export function Card1() {
  const items: ICard1Items = [
    { logo: '1.png', brand: 'Nike' },
    { logo: '2.png', brand: 'Adidas' },
    { logo: '3.png', brand: 'Puma' },
    { logo: '4.png', brand: 'New Balance' },
    { logo: '5.png', brand: 'Converse' },
    { logo: '6.png', brand: 'Reebok' },
    { logo: '7.png', brand: 'Sketchers' },
  ];

  const renderItem = (item: ICard1Item, index: number) => {
    const ImageWithPlaceholder = () => {
      const [imageLoaded, setImageLoaded] = useState(false);
      const [imageError, setImageError] = useState(false);

      return (
        <div className="relative h-[100px] w-full flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}

          {!imageError && (
            <img
              src={toAbsoluteUrl(`/media/store/client/600x600/${item.logo}`)}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`h-[100px] shrink-0 group-hover:scale-110 transition-transform duration-500 ease-out object-contain ${
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
      );
    };

    return (
      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <CardContent className="flex flex-col items-center justify-center pb-0">
          <div className="hover:text-primary text-sm font-medium text-mono group-hover:text-primary transition-colors duration-300">
            {item.brand}
          </div>

          <ImageWithPlaceholder />
        </CardContent>
      </Card>
    );
  };

  return (
    <Fragment>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}
