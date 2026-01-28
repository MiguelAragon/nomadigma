'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card2 } from '@/app/(public)/store/components/common/card2';
import { CATEGORY_SHOP } from '@/config/categories';
import { useTranslation } from '@/hooks/use-translation';

interface Product {
  id: string;
  slugEn: string | null;
  slugEs: string | null;
  titleEn: string;
  titleEs: string;
  price: number;
  isOnSale?: boolean;
  discountPercentage?: number | null;
  images: string[];
}

interface ProductsByCategory {
  [category: string]: Product[];
}

export function Deals() {
  const { locale, t } = useTranslation();
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);

  // Obtener las primeras 4 keys del catálogo
  const categoryKeys = Object.keys(CATEGORY_SHOP).slice(0, 4);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Obtener las categorías usando los keys (como están en la DB)
        const categories = categoryKeys.map(key => key);
        const productsByCategoryResult: ProductsByCategory = {};
        
        // Hacer una llamada por categoría para obtener los últimos 4 productos
        await Promise.all(
          categories.map(async (category) => {
            try {
              const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=4&sort=newest`);
              const result = await response.json();
              
              if (result.success && result.data && result.data.products) {
                productsByCategoryResult[category] = result.data.products;
              }
            } catch (error) {
              console.error(`Error fetching products for category ${category}:`, error);
            }
          })
        );
        
        setProductsByCategory(productsByCategoryResult);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProduct = (product: Product, index: number) => {
    const title = locale === 'en' ? product.titleEn : product.titleEs;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
    
    // Usar finalPrice si existe, sino usar price (sin descuento)
    const productAny = product as any;
    let finalPrice = productAny.finalPrice !== null && productAny.finalPrice !== undefined 
      ? productAny.finalPrice 
      : product.price;
    
    // Si es gratis (100% descuento), el precio final SIEMPRE es 0
    if (product.isOnSale && product.discountPercentage === 100) {
      finalPrice = 0;
    }
    
    const price = finalPrice.toFixed(2);
    
    // Obtener slug según el locale, priorizando el slug del idioma actual
    // Si no hay slug en el idioma actual, usar el del otro idioma
    let productSlug: string | undefined;
    if (locale === 'en') {
      productSlug = product.slugEn || product.slugEs || undefined;
    } else {
      productSlug = product.slugEs || product.slugEn || undefined;
    }
    
    // Debug: ver qué slug tenemos
    if (!productSlug) {
      console.warn('Product without slug:', { id: product.id, title, slugEn: product.slugEn, slugEs: product.slugEs });
    }
    
    // Precio original: usar price directamente (siempre es el precio original)
    // SIEMPRE mostrar precio original si hay descuento (incluido 100% para productos gratis)
    const originalPrice = product.isOnSale && product.discountPercentage && product.discountPercentage > 0 && product.price > 0
      ? product.price.toFixed(2)
      : undefined;

    return (
    <Card2
        key={product.id}
        logo={imageUrl || '/placeholder-image.png'}
        title={title}
        total={price}
        label={undefined}
        badge={false}
        productId={product.id}
        productSlug={productSlug}
        isOnSale={product.isOnSale}
        discountPercentage={product.discountPercentage}
        originalPrice={originalPrice}
      />
    );
  };

  const renderCategoryRow = (categoryKey: string) => {
    const categoryData = CATEGORY_SHOP[categoryKey];
    const categoryName = categoryData[locale as 'en' | 'es'];
    const categoryDbName = categoryKey; // Usar el key directamente (guides, services, essentials, others)
    const products = productsByCategory[categoryDbName] || [];

    if (loading) {
      return (
        <div key={categoryKey} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-medium text-mono">
              {categoryName}
            </span>
            <Button variant="link" asChild disabled>
              <Link href={`/store/products?category=${encodeURIComponent(categoryDbName)}`}>
                {t('common.see_more')} <ChevronRight />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
  );
    }

    if (products.length === 0) {
      return null;
    }

  return (
      <div key={categoryKey} className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-lg font-medium text-mono">
            {categoryName}
        </span>

        <Button variant="link" asChild>
            <Link href={`/store/products?category=${encodeURIComponent(categoryDbName)}`}>
              {t('common.see_more')} <ChevronRight />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-2">
          {products.map((product, index) => renderProduct(product, index))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {categoryKeys.map((key) => renderCategoryRow(key))}
    </div>
  );
}
