'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

interface ICard2Props {
  badge?: boolean;
  logo: string;
  title: string;
  total: string;
  star?: string;
  label?: string;
  productId?: string;
  productSlug?: string;
  isOnSale?: boolean;
  discountPercentage?: number | null;
  originalPrice?: string;
}

export function Card2({ badge, logo, title, total, star, label, productId, productSlug, isOnSale, discountPercentage, originalPrice }: ICard2Props) {
  const router = useRouter();
  const { locale } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determinar si la imagen es una URL completa o una ruta relativa
  const imageSrc = logo.startsWith('http') ? logo : toAbsoluteUrl(`/media/store/client/600x600/${logo}`);
  
  const handleProductClick = () => {
    // Verificar que productSlug exista y no esté vacío
    const slug = productSlug?.trim();
    if (slug && slug.length > 0) {
      router.push(`/store/products/${slug}`);
    } else if (productId) {
      // Si no hay slug pero hay productId, usar el ID directamente
      router.push(`/store/products/${productId}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer flex flex-col h-full"
      onClick={handleProductClick}
    >
      <CardContent className="flex flex-col p-2.5 gap-4 h-full">
        <div className="flex-1 flex flex-col">
          <Card className="flex items-center justify-center relative bg-accent/50 w-full h-[180px] mb-4 shadow-none overflow-hidden">
            {badge && (
              <Badge
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 uppercase z-10"
              >
                save 40%
              </Badge>
            )}

            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 shimmer"></div>
            )}

            {!imageError && (
              <img
                src={imageSrc}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                className={`h-[180px] shrink-0 object-cover w-full group-hover:scale-110 transition-transform duration-500 ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                alt={title}
              />
            )}

            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-muted-foreground text-sm">No image</div>
              </div>
            )}
          </Card>

          <div className="hover:text-primary text-sm font-medium text-mono px-2.5 leading-5.5 block group-hover:text-primary transition-colors duration-300 flex-grow">
            {title}
          </div>
        </div>

        <div className="flex items-center flex-wrap justify-between gap-5 px-2.5 pb-1 mt-auto">
          {/* Badge de descuento o Gratis */}
          {isOnSale && discountPercentage === 100 ? (
            <Badge
              size="sm"
              variant="destructive"
              className="rounded-full"
            >
              {locale === 'es' ? 'Gratis' : 'Free'}
            </Badge>
          ) : isOnSale && discountPercentage ? (
            <Badge
              size="sm"
              variant="destructive"
              className="rounded-full"
            >
              -{discountPercentage}%
            </Badge>
          ) : star ? (
            <Badge
              size="sm"
              variant="warning"
              shape="circle"
              className="rounded-full gap-1"
            >
              <Star
                className="text-white -mt-0.5"
                style={{ fill: 'currentColor' }}
              />{' '}
              {star}
            </Badge>
          ) : (
            <div></div>
          )}

          {/* Precios: mostrar anterior y actual solo si son diferentes */}
          <div className="flex items-center flex-wrap gap-1.5 ml-auto">
            {(() => {
              // Si es gratis (100% descuento), SIEMPRE mostrar precio anterior tachado y $0.00
              if (isOnSale && discountPercentage === 100 && originalPrice) {
                return (
                  <>
                    <span className="text-xs font-normal text-muted-foreground line-through pt-[1px]">
                      ${originalPrice}
                    </span>
                    <span className="text-sm font-medium text-mono">$0.00</span>
                  </>
                );
              }
              
              // Convertir total a número para comparar
              const currentPrice = parseFloat(total) || 0;
              const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
              
              // Si hay precio original y es diferente al precio actual, mostrar ambos
              if (originalPriceNum !== null && originalPriceNum !== currentPrice) {
                return (
                  <>
                    <span className="text-xs font-normal text-muted-foreground line-through pt-[1px]">
                      ${originalPrice}
                    </span>
                    <span className="text-sm font-medium text-mono">${total}</span>
                  </>
                );
              }
              
              // Si no hay diferencia o no hay precio original, solo mostrar precio actual
              return (
                <>
                  {label && (
                    <span className="text-xs font-normal text-secondary-foreground line-through pt-[1px]">
                      {label}
                    </span>
                  )}
                  <span className="text-sm font-medium text-mono">${total}</span>
                </>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
