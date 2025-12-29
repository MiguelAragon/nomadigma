/**
 * Configuración central de categorías del blog
 * Las categorías se guardan en inglés en la DB pero se muestran traducidas
 */

export const BLOG_CATEGORIES = [
  'Experiences',
  'Adventures',
  'Guides',
  'Travel Hacks',
  'Culture & History',
  'Photography',
  'Learning',
  'Reflections',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

// Traducciones de categorías
export const CATEGORY_TRANSLATIONS: Record<BlogCategory, { es: string; en: string }> = {
  'Experiences': { es: 'Experiencias', en: 'Experiences' },
  'Adventures': { es: 'Aventuras', en: 'Adventures' },
  'Guides': { es: 'Guías', en: 'Guides' },
  'Travel Hacks': { es: 'Tips de viaje', en: 'Travel Hacks' },
  'Culture & History': { es: 'Cultura e Historia', en: 'Culture & History' },
  'Photography': { es: 'Fotografía', en: 'Photography' },
  'Learning': { es: 'Aprendizaje', en: 'Learning' },
  'Reflections': { es: 'Reflexiones', en: 'Reflections' },
};

/**
 * Obtiene el nombre traducido de una categoría
 */
export function getCategoryLabel(category: string, locale: 'en' | 'es'): string {
  if (category in CATEGORY_TRANSLATIONS) {
    return CATEGORY_TRANSLATIONS[category as BlogCategory][locale];
  }
  return category;
}

/**
 * Obtiene todas las categorías traducidas para un locale
 */
export function getCategories(locale: 'en' | 'es'): string[] {
  return BLOG_CATEGORIES.map(cat => getCategoryLabel(cat, locale));
}

/**
 * Convierte una categoría traducida a su valor en inglés (para guardar en DB)
 */
export function getCategoryValue(translatedCategory: string, locale: 'en' | 'es'): string {
  // Si ya es inglés, retornarlo
  if (BLOG_CATEGORIES.includes(translatedCategory as any)) {
    return translatedCategory;
  }
  
  // Buscar por traducción
  for (const [key, value] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (value[locale] === translatedCategory) {
      return key;
    }
  }
  
  return translatedCategory;
}

