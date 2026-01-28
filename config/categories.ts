/**
 * Configuración central de categorías del blog y shop
 * Las categorías se guardan como valores (keys) en la DB pero se muestran traducidas
 */

import { BookOpen, FileText, Wrench, Briefcase, Shirt, Map, ShoppingBag, Package, Camera, BookOpenCheck, Sparkles, Globe } from "lucide-react";

/**
 * Catálogo de categorías del blog
 * El key es el valor que se guarda en la DB
 */
export const CATEGORY_BLOG: Record<string, { es: string; en: string; icon: any }> = {
  'experiences': { es: 'Experiencias', en: 'Experiences', icon: Sparkles },
  'adventures': { es: 'Aventuras', en: 'Adventures', icon: Map },
  'guides': { es: 'Guías', en: 'Guides', icon: BookOpenCheck },
  'travel-hacks': { es: 'Tips de viaje', en: 'Travel Hacks', icon: Wrench },
  'culture-history': { es: 'Cultura e Historia', en: 'Culture & History', icon: Globe },
  'photography': { es: 'Fotografía', en: 'Photography', icon: Camera },
  'learning': { es: 'Aprendizaje', en: 'Learning', icon: BookOpen },
  'reflections': { es: 'Reflexiones', en: 'Reflections', icon: FileText },
};

export type BlogCategoryKey = keyof typeof CATEGORY_BLOG;

/**
 * Catálogo de categorías del shop
 * El key es el valor que se guarda en la DB
 */
export const CATEGORY_SHOP: Record<string, { es: string; en: string; icon: any; description: { es: string; en: string } }> = {
  'guides': { es: 'Guides', en: 'Guides', icon: Map, description: { es: 'Guías de viaje y recursos', en: 'Travel guides and resources' } },
  'services': { es: 'Services', en: 'Services', icon: Briefcase, description: { es: 'Servicios profesionales', en: 'Professional services' } },
  'essentials': { es: 'Essentials', en: 'Essentials', icon: ShoppingBag, description: { es: 'Productos esenciales para viajar', en: 'Essential travel products' } },
  'others': { es: 'Others', en: 'Others', icon: Package, description: { es: 'Otros productos', en: 'Other products' } },
};

export type ShopCategoryKey = keyof typeof CATEGORY_SHOP;

/**
 * Obtiene el nombre traducido de una categoría del blog
 */
export function getBlogCategoryLabel(category: string, locale: 'en' | 'es'): string {
  if (category in CATEGORY_BLOG) {
    return CATEGORY_BLOG[category as BlogCategoryKey][locale];
  }
  return category;
}

/**
 * Obtiene todas las categorías del blog traducidas para un locale
 */
export function getBlogCategories(locale: 'en' | 'es'): Array<{ value: string; label: string }> {
  return Object.entries(CATEGORY_BLOG).map(([key, data]) => ({
    value: key,
    label: data[locale],
  }));
}

/**
 * Obtiene el nombre traducido de una categoría del shop
 */
export function getShopCategoryLabel(category: string, locale: 'en' | 'es'): string {
  if (category in CATEGORY_SHOP) {
    return CATEGORY_SHOP[category as ShopCategoryKey][locale];
  }
  return category;
}

// Mantener funciones legacy para compatibilidad
export const BLOG_CATEGORIES = Object.keys(CATEGORY_BLOG) as Array<BlogCategoryKey>;
export type BlogCategory = BlogCategoryKey;

/**
 * @deprecated Usar getBlogCategoryLabel en su lugar
 */
export function getCategoryLabel(category: string, locale: 'en' | 'es'): string {
  return getBlogCategoryLabel(category, locale);
}

/**
 * @deprecated Usar getBlogCategories en su lugar
 */
export function getCategories(locale: 'en' | 'es'): string[] {
  return getBlogCategories(locale).map(cat => cat.label);
}

/**
 * @deprecated Ya no es necesario, las categorías se guardan directamente como keys
 */
export function getCategoryValue(translatedCategory: string, locale: 'en' | 'es'): string {
  // Buscar por traducción
  for (const [key, value] of Object.entries(CATEGORY_BLOG)) {
    if (value[locale] === translatedCategory || key === translatedCategory) {
      return key;
    }
  }
  return translatedCategory;
}

