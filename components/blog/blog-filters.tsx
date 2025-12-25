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
  Tag,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export interface BlogFiltersState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  categories: string[];
  hashtags: string[];
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

const CATEGORIES = [
  'Viajes',
  'Fotografía',
  'Gastronomía',
  'Aventuras',
  'Cultura',
  'Naturaleza',
];

const POPULAR_HASHTAGS = [
  '#nomadigma',
  '#viajes',
  '#aventura',
  '#fotografia',
  '#gastronomia',
  '#cultura',
];

export function BlogFilters({ onFiltersChange }: BlogFiltersProps) {
  const [filters, setFilters] = useState<BlogFiltersState>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    categories: [],
    hashtags: [],
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    sort: true,
    categories: true,
    hashtags: true,
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

  const toggleHashtag = (hashtag: string) => {
    const newHashtags = filters.hashtags.includes(hashtag)
      ? filters.hashtags.filter(h => h !== hashtag)
      : [...filters.hashtags, hashtag];
    updateFilters({ hashtags: newHashtags });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    filters.search || 
    filters.categories.length > 0 || 
    filters.hashtags.length > 0;

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
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm group-hover:text-indigo-600 transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
            {filters.categories.length > 0 && (
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                {filters.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                  >
                    {category}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Hashtags */}
      <Card>
        <CardHeader 
          className="cursor-pointer relative pb-4"
          onClick={() => toggleSection('hashtags')}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Hashtags
            {filters.hashtags.length > 0 && (
              <Badge className="ml-auto">{filters.hashtags.length}</Badge>
            )}
          </CardTitle>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {expandedSections.hashtags ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.hashtags && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {POPULAR_HASHTAGS.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant={filters.hashtags.includes(hashtag) ? 'default' : 'outline'}
                  className="text-xs cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  onClick={() => toggleHashtag(hashtag)}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
            {filters.hashtags.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Seleccionados:</p>
                <div className="flex flex-wrap gap-1">
                  {filters.hashtags.map((hashtag) => (
                    <Badge
                      key={hashtag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                      onClick={() => toggleHashtag(hashtag)}
                    >
                      {hashtag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
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
                {filters.categories.map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {filters.hashtags.map((hashtag) => (
                  <Badge key={hashtag} variant="outline" className="text-xs">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

