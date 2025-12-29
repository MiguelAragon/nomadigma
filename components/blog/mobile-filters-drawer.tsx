'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Filter, 
  X,
  Search
} from 'lucide-react';
import { CompactFiltersState } from './compact-filters';
import { useTranslation } from '@/hooks/use-translation';
import { BLOG_CATEGORIES, getCategoryLabel } from '@/config/categories';

interface MobileFiltersDrawerProps {
  filters: CompactFiltersState;
  onFiltersChange: (filters: CompactFiltersState) => void;
  hasActiveFilters: boolean;
}

export function MobileFiltersDrawer({ filters, onFiltersChange, hasActiveFilters }: MobileFiltersDrawerProps) {
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilters = (newFilters: Partial<CompactFiltersState>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const clearAllFilters = () => {
    const clearedFilters: CompactFiltersState = {
      search: '',
      categories: [],
    };
    onFiltersChange(clearedFilters);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0">
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              !
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-screen w-[85vw] sm:w-[400px]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg">{locale === 'es' ? 'Filtros' : 'Filters'}</DrawerTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-8"
                >
                  {locale === 'es' ? 'Limpiar' : 'Clear'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">{locale === 'es' ? 'Búsqueda' : 'Search'}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder={locale === 'es' ? 'Buscar en posts...' : 'Search posts...'}
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 pr-10"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => updateFilters({ search: '' })}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {locale === 'es' ? 'Categorías' : 'Categories'}
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.categories.length}
                </Badge>
              )}
            </label>
            <div className="space-y-2">
              {BLOG_CATEGORIES.map((category) => {
                const label = getCategoryLabel(category, locale as 'en' | 'es');
                return (
                  <label
                    key={category}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 size-4"
                    />
                    <span className="text-sm flex-1">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {locale === 'es' ? 'Filtros activos:' : 'Active filters:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    {locale === 'es' ? 'Búsqueda:' : 'Search:'} "{filters.search}"
                    <button
                      onClick={() => updateFilters({ search: '' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.categories.map((category) => {
                  const label = getCategoryLabel(category, locale as 'en' | 'es');
                  return (
                    <Badge key={category} variant="secondary" className="gap-1">
                      {label}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t pt-4">
          <Button onClick={() => setIsOpen(false)} className="w-full" size="lg">
            {locale === 'es' ? 'Aplicar' : 'Apply'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

