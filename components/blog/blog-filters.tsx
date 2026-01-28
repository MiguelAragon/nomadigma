'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  FileText,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { CATEGORY_BLOG, getBlogCategoryLabel } from '@/config/categories';

export interface BlogFiltersState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  categories: string[];
}

interface BlogFiltersProps {
  onFiltersChange?: (filters: BlogFiltersState) => void;
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Fecha de publicación' },
  { value: 'likes', label: 'Me gusta' },
  { value: 'comments', label: 'Comentarios' },
  { value: 'views', label: 'Visualizaciones' },
];


export function BlogFilters({ onFiltersChange }: BlogFiltersProps) {
  const [filters, setFilters] = useState<BlogFiltersState>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    categories: [],
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    sort: true,
    categories: true,
  });

  const updateFilters = (newFilters: Partial<BlogFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };


  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    filters.search || 
    filters.categories.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <Card>
        <CardHeader 
          className="cursor-pointer relative pb-4"
          onClick={() => toggleSection('search')}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Búsqueda
          </CardTitle>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {expandedSections.search ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.search && (
          <CardContent className="pt-0">
            <Input
              placeholder="Buscar en posts..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full"
            />
          </CardContent>
        )}
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader 
          className="cursor-pointer relative pb-4"
          onClick={() => toggleSection('sort')}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            Ordenar por
          </CardTitle>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {expandedSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.sort && (
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ sortBy: option.value })}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilters({ sortOrder: 'asc' })}
                className="flex-1 text-xs"
              >
                <SortAsc className="h-3 w-3 mr-1" />
                Asc
              </Button>
              <Button
                variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilters({ sortOrder: 'desc' })}
                className="flex-1 text-xs"
              >
                <SortDesc className="h-3 w-3 mr-1" />
                Desc
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader 
          className="cursor-pointer relative pb-4"
          onClick={() => toggleSection('categories')}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Categorías
            {filters.categories.length > 0 && (
              <Badge className="ml-auto">{filters.categories.length}</Badge>
            )}
          </CardTitle>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.categories && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(CATEGORY_BLOG).map(([categoryKey, categoryData]) => {
                const label = categoryData['es']; // Usar español por defecto, se puede hacer dinámico
                return (
                <label
                  key={categoryKey}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(categoryKey)}
                    onChange={() => toggleCategory(categoryKey)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm group-hover:text-indigo-600 transition-colors">
                    {label}
                  </span>
                </label>
                );
              })}
            </div>
            {filters.categories.length > 0 && (
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                {filters.categories.map((categoryKey) => {
                  const label = getBlogCategoryLabel(categoryKey, 'es'); // Usar español por defecto
                  return (
                  <Badge
                    key={categoryKey}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(categoryKey);
                    }}
                  >
                    {label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Filtros activos:
              </p>
              <div className="flex flex-wrap gap-1">
                {filters.search && (
                  <Badge variant="outline" className="text-xs">
                    Búsqueda: "{filters.search}"
                  </Badge>
                )}
                {filters.categories.map((categoryKey) => {
                  const label = getBlogCategoryLabel(categoryKey, 'es'); // Usar español por defecto
                  return (
                  <Badge key={categoryKey} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

