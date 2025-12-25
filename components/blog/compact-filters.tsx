'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown,
  X,
  Check,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MobileFiltersDrawer } from './mobile-filters-drawer';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface CompactFiltersState {
  search: string;
  categories: string[];
}

interface CompactFiltersProps {
  filters: CompactFiltersState;
  onFiltersChange: (filters: CompactFiltersState) => void;
}

const CATEGORIES = {
  es: [
    'Viajes',
    'Fotografía',
    'Gastronomía',
    'Aventuras',
    'Cultura',
    'Naturaleza',
  ],
  en: [
    'Travel',
    'Photography',
    'Gastronomy',
    'Adventures',
    'Culture',
    'Nature',
  ],
};

export function CompactFilters({ filters, onFiltersChange }: CompactFiltersProps) {
  const { locale } = useTranslation();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || locale || 'en';
  const categories = CATEGORIES[locale as 'es' | 'en'] || CATEGORIES.es;
  const updateFilters = (newFilters: Partial<CompactFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    onFiltersChange(updatedFilters);
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

  const hasActiveFilters = 
    filters.search || 
    filters.categories.length > 0;

  return (
    <div className="space-y-3">
      {/* Top Row - Search + Dropdowns */}
      <div className="flex flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4 z-10" />
          <Input
            placeholder={locale === 'es' ? 'Buscar en posts...' : 'Search posts...'}
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 pr-10 bg-background border-border shadow-sm"
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

        {/* Mobile Filter Button - Same row as search */}
        <div className="md:hidden flex items-center">
          <MobileFiltersDrawer
            filters={filters}
            onFiltersChange={onFiltersChange}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Desktop Dropdowns - Hidden on Mobile */}
        <div className="hidden md:flex gap-3">
          {/* Categories Dropdown */}
          <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[140px] bg-background border-border shadow-sm">
              <span>{locale === 'es' ? 'Categorías' : 'Categories'}</span>
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filters.categories.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[280px]">
            <DropdownMenuLabel>{locale === 'es' ? 'Seleccionar categorías' : 'Select categories'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  className="cursor-pointer"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Post Button - Only when logged in */}
        {isSignedIn && (
          <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href={`/${currentLocale}/blog/editor`} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {locale === 'es' ? 'Crear post' : 'Create post'}
            </Link>
          </Button>
        )}
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <span className="text-sm font-medium text-muted-foreground">
            {locale === 'es' ? 'Filtros activos:' : 'Active filters:'}
          </span>
          
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

          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="ml-auto text-xs"
          >
            {locale === 'es' ? 'Limpiar todo' : 'Clear all'}
          </Button>
        </div>
      )}
    </div>
  );
}

