import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useLanguage } from '@/providers/i18n-provider';

// Re-export useTranslation with proper typing and add locale from context
export const useTranslation = (namespace?: string) => {
  const translation = useI18nextTranslation(namespace);
  const { locale } = useLanguage();
  
  return {
    ...translation,
    locale,
    i18n: translation.i18n, // Expose i18n instance for debugging
  };
};

export default useTranslation;
