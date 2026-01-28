'use client';

import { useState, useMemo } from 'react';
import { ProductView } from '@/components/product/product-view';
import { Container } from '@/components/ui/container';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { useLanguage } from '@/providers/i18n-provider';
import { toast } from 'sonner';

interface ProductRaw {
  id: string;
  slugEn?: string;
  slugEs?: string;
  titleEn?: string;
  titleEs?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  category: string;
  price: number;
  finalPrice?: number | null;
  isOnSale?: boolean;
  discountPercentage?: number | null;
  productType?: 'PHYSICAL' | 'DIGITAL';
  images: string[];
  variants?: Array<{ language: string; label: string; values: string[] }> | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
}

interface ProductContentProps {
  product: ProductRaw;
}

export function ProductContent({ product }: ProductContentProps) {
  const { handleAddToCart } = useStoreClient();
  const { locale } = useLanguage();
  
  // Obtener título y descripción según el locale actual
  const title = useMemo(() => {
    return locale === 'en' 
      ? (product.titleEn || product.titleEs || '')
      : (product.titleEs || product.titleEn || '');
  }, [locale, product.titleEn, product.titleEs]);
  
  const description = useMemo(() => {
    return locale === 'en'
      ? (product.descriptionEn || product.descriptionEs || '')
      : (product.descriptionEs || product.descriptionEn || '');
  }, [locale, product.descriptionEn, product.descriptionEs]);
  
  // Filtrar variantes por idioma del locale actual
  const variants = useMemo(() => {
    if (!product.variants || !Array.isArray(product.variants)) {
      return [];
    }
    
    // Filtrar variantes por idioma del locale
    const variantsForLocale = product.variants.filter((v: any) => 
      v && typeof v === 'object' && v.language === locale
    );
    
    // Agrupar por label (por si hay duplicados)
    const groupedVariants: { [key: string]: string[] } = {};
    variantsForLocale.forEach((v: any) => {
      if (v.label && Array.isArray(v.values) && v.values.length > 0) {
        if (!groupedVariants[v.label]) {
          groupedVariants[v.label] = [];
        }
        // Combinar valores únicos
        v.values.forEach((val: string) => {
          if (val && !groupedVariants[v.label].includes(val)) {
            groupedVariants[v.label].push(val);
          }
        });
      }
    });
    
    // Convertir a formato esperado
    return Object.entries(groupedVariants).map(([label, values]) => ({
      label,
      values
    }));
  }, [locale, product.variants]);

  // Calcular precio final y original
  const finalPrice = useMemo(() => {
    // Si es gratis (100% descuento), el precio final es 0
    if (product.isOnSale && product.discountPercentage === 100) {
      return 0;
    }
    // Usar finalPrice si existe, sino usar price
    return product.finalPrice !== null && product.finalPrice !== undefined 
      ? product.finalPrice 
      : product.price;
  }, [product.finalPrice, product.price, product.isOnSale, product.discountPercentage]);

  // Precio original: siempre es product.price cuando hay descuento
  const originalPrice = useMemo(() => {
    if (product.isOnSale && product.discountPercentage && product.discountPercentage > 0 && product.price > 0) {
      return product.price;
    }
    return undefined;
  }, [product.isOnSale, product.discountPercentage, product.price]);

  const handleAddToCartClick = (selectedVariants?: Record<string, string>) => {
    if (handleAddToCart && product.active) {
      const currentSlug = locale === 'en' 
        ? (product.slugEn || product.slugEs || '')
        : (product.slugEs || product.slugEn || '');
      const cartItem = {
        id: product.id,
        logo: product.images[0] || '',
        title: title,
        total: finalPrice.toFixed(2),
        sku: currentSlug,
        quantity: 1,
        productType: product.productType || 'PHYSICAL',
        selectedVariants: selectedVariants || {},
      };
      handleAddToCart(cartItem);
      toast.success(locale === 'es' ? 'Producto agregado al carrito' : 'Product added to cart');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <Container className="py-8">
        <article 
          itemScope 
          itemType="https://schema.org/Product"
        >
          {/* Hidden metadata for schema */}
          <meta itemProp="name" content={title} />
          <meta itemProp="description" content={description.replace(/<[^>]*>/g, '').substring(0, 200)} />
          <meta itemProp="price" content={finalPrice.toString()} />
          <meta itemProp="priceCurrency" content="USD" />
          {product.images[0] && (
            <meta itemProp="image" content={product.images[0]} />
          )}

          <ProductView
            title={title}
            description={description}
            category={product.category}
            price={finalPrice}
            originalPrice={originalPrice}
            isOnSale={product.isOnSale}
            discountPercentage={product.discountPercentage}
            images={product.images}
            variants={variants}
            createdAt={product.createdAt}
            active={product.active}
            locale={locale}
            animate={false}
            onAddToCart={handleAddToCartClick}
            productId={product.id}
          />
        </article>
      </Container>
    </div>
  );
}

