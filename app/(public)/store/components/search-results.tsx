'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutGrid, List, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, InputGroup } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card2 } from '@/app/(public)/store/components/common/card2';
import { Card3 } from '@/app/(public)/store/components/common/card3';
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
  category: string;
}

type SearchResultsType = 'card' | 'list';

export function SearchResults({ mode }: { mode: SearchResultsType }) {
  const { locale, t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activePeriod, setActivePeriod] = useState('All');
  const [activeTab, setActiveTab] = useState<SearchResultsType>(mode);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Obtener categorías seleccionadas de la URL (pueden venir separadas por comas)
  const categoryParam = searchParams.get('category');
  const initialCategories = categoryParam ? categoryParam.split(',').map(c => c.trim()) : [];
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);

  // Sincronizar con URL cuando cambia el query param
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(',').map(c => c.trim()));
    } else {
      setSelectedCategories([]);
    }
    setSearchInput(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Obtener todas las categorías del catálogo (usar keys para la DB)
  const allCategories = Object.keys(CATEGORY_SHOP).map(key => ({
    key,
    dbName: key, // Usar el key directamente (guides, services, essentials, others)
    label: CATEGORY_SHOP[key][locale as 'en' | 'es'], // Nombre traducido para mostrar
  }));

  // Función para actualizar la URL con los filtros
  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/store/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleCategoryToggle = (categoryDbName: string) => {
    const newCategories = selectedCategories.includes(categoryDbName)
      ? selectedCategories.filter(cat => cat !== categoryDbName)
      : [...selectedCategories, categoryDbName];
    
    setSelectedCategories(newCategories);
    updateURL({ category: newCategories.length > 0 ? newCategories.join(',') : null });
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateURL({ search: value || null });
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    updateURL({ sort: value || null });
  };

  // Fetch productos
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchInput) params.set('search', searchInput);
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
      if (sortBy) params.set('sort', sortBy);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data.products || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchInput, selectedCategories, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    
    const productSlug = locale === 'en' 
      ? (product.slugEn || product.slugEs || '')
      : (product.slugEs || product.slugEn || '');
    
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

  return (
    <div className="flex flex-col items-stretch gap-7">
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center flex-1 group">
          <div className="relative flex-1">
          <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4 z-10"
          />
          <Input
            id="search-input"
            value={searchInput}
              placeholder={locale === 'es' ? 'Buscar productos...' : 'Search products...'}
            onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchInput);
                }
              }}
              className="pl-10 pr-2 rounded-r-none bg-background border-border shadow-sm"
          />
          </div>
          <Button
            onClick={() => handleSearch(searchInput)}
            className="rounded-l-none h-8.5"
            variant="default"
          >
            <SearchIcon className="size-4" />
            {locale === 'es' ? 'Buscar' : 'Search'}
          </Button>
        </div>

        {/* Selector múltiple de categorías - Dropdown en la misma línea */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[140px] bg-background border-border shadow-sm">
              <span>{locale === 'es' ? 'Categorías' : 'Categories'}</span>
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {selectedCategories.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[280px]">
            <DropdownMenuLabel>
              {locale === 'es' ? 'Seleccionar categorías' : 'Select categories'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
              {allCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.key}
                  checked={selectedCategories.includes(category.dbName)}
                  onCheckedChange={() => handleCategoryToggle(category.dbName)}
                  className="cursor-pointer"
                >
                  {category.label}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-5 justify-between mt-3">
        <h3 className="text-sm text-mono font-medium">
          {loading ? (
            <span>{locale === 'es' ? 'Cargando...' : 'Loading...'}</span>
          ) : (
            <>
              {total > 0 ? (
                <>
                  1 - {Math.min(products.length, total)} de {total} {locale === 'es' ? 'resultados' : 'results'}
                  {searchInput && (
                    <span className="text-destructive"> {locale === 'es' ? 'para' : 'for'} "{searchInput}"</span>
                  )}
                </>
              ) : (
                <span>{locale === 'es' ? 'No se encontraron productos' : 'No products found'}</span>
              )}
            </>
          )}
        </h3>

        <div className="flex items-center gap-2.5">
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-[175px]">
              <SelectValue placeholder={locale === 'es' ? 'Ordenar por' : 'Sort by'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{locale === 'es' ? 'Más recientes' : 'Newest'}</SelectItem>
              <SelectItem value="oldest">{locale === 'es' ? 'Más antiguos' : 'Oldest'}</SelectItem>
              <SelectItem value="price-low">{locale === 'es' ? 'Precio: Menor a Mayor' : 'Price: Low to High'}</SelectItem>
              <SelectItem value="price-high">{locale === 'es' ? 'Precio: Mayor a Menor' : 'Price: High to Low'}</SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            variant="outline"
            value={activeTab}
            onValueChange={(value) => {
              if (value === 'card' || value === 'list') setActiveTab(value);
            }}
          >
            <ToggleGroupItem value="card">
              <LayoutGrid size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="list">
              <List size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {loading ? (
        <div className={activeTab === 'card' ? 'grid sm:grid-cols-4 gap-5 mb-2' : 'grid grid-cols-1 gap-5'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-muted-foreground">
            {locale === 'es' ? 'No se encontraron productos' : 'No products found'}
          </p>
        </div>
      ) : (
      <div
        className={
          activeTab === 'card'
            ? 'grid sm:grid-cols-4 gap-5 mb-2'
            : 'grid grid-cols-1 gap-5'
        }
      >
          {products.map((product, index) => renderProduct(product, index))}
      </div>
      )}
    </div>
  );
}

