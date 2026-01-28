'use client';

import { Fragment, useState, memo, useMemo } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useStoreClient } from '@/app/(public)/store/components/context';

interface ICard4Props {
  limit: number;
}

// Componente de imagen memoizado para evitar re-renders
interface ImageWithPlaceholderProps {
  imageUrl: string;
  alt: string;
}

const ImageWithPlaceholderComponent = ({ imageUrl, alt }: ImageWithPlaceholderProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="flex items-center justify-center bg-accent/50 h-[70px] w-[90px] shadow-none overflow-hidden relative">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 shimmer"></div>
      )}

      {!imageError && (
        <img
          src={imageUrl}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`cursor-pointer h-[70px] object-contain group-hover:scale-110 transition-transform duration-500 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          alt={alt}
        />
      )}

      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-xs">No image</div>
        </div>
      )}
    </Card>
  );
};

const ImageWithPlaceholder = memo(ImageWithPlaceholderComponent);

const Card4Component = ({ limit }: ICard4Props) => {
  const { state } = useStoreClient();
  // Memoizar items usando una key estable basada en IDs y datos relevantes
  const items = useMemo(() => {
    // Solo re-calcular si realmente cambió el contenido del carrito
    return state.cartItems;
  }, [
    // Dependencias: solo re-calcular si cambia la longitud o los IDs/cantidades
    state.cartItems.length,
    state.cartItems.map(i => `${i.id}-${i.quantity}-${i.total}`).join(',')
  ]);

  const renderItem = (item: typeof items[0], index: number) => {
    // Handle image URL - could be a full URL or a relative path
    const imageUrl = item.logo.startsWith('http') || item.logo.startsWith('/')
      ? item.logo
      : toAbsoluteUrl(`/media/store/client/600x600/${item.logo}`);

    return (
      <Card key={item.id || index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <CardContent className="flex items-center flex-wrap justify-between gap-4.5 p-2 pe-5">
          <div className="flex items-center gap-3.5">
            <ImageWithPlaceholder imageUrl={imageUrl} alt={item.title} />

            <div className="flex flex-col gap-1">
              <Link
                href={`/store/products/${item.sku}`}
                className="hover:text-primary text-sm font-medium text-mono leading-5.5 group-hover:text-primary transition-colors duration-300"
              >
                {item.title}
              </Link>
              {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {Object.entries(item.selectedVariants).map(([label, value]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{label}:</span>
                      <span className="text-xs text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-normal text-secondary-foreground text-end">
              {item.quantity}&nbsp;x
            </span>
            <div className="flex items-center flex-wrap gap-1.5">
              {item.label && (
                <span className="text-sm font-normal text-secondary-foreground line-through">
                  {item.label}
                </span>
              )}
              <span className="text-sm font-semibold text-mono">
                ${item.total}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay productos en el carrito</p>
      </div>
    );
  }

  const itemsToRender = useMemo(() => 
    items.slice(0, limit),
    [items, limit]
  );

  return (
    <Fragment>
      {itemsToRender.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
};

// Memoizar el componente para evitar re-renders cuando cambian props no relacionadas
// Card4 solo debe re-renderizarse cuando cambia el limit prop
export const Card4 = memo(Card4Component);
