'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';
import { I18N_LANGUAGES } from '@/i18n/config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useRouter, usePathname } from 'next/navigation';

// Import translation files
import enTranslations from '@/i18n/languages/en.json';
import esTranslations from '@/i18n/languages/es.json';

interface I18nContextType {
  locale: string;
  changeLanguage: (code: string) => void;
  language: typeof I18N_LANGUAGES[0];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

function I18nProvider({ children, locale: initialLocale }: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Obtener locale del storage
  const getLocaleFromStorage = () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('language');
    return stored && I18N_LANGUAGES.some(lang => lang.code === stored) ? stored : null;
  };
  
  // Usar initialLocale si existe, sino localStorage, sino español por defecto
  const localeToUse = initialLocale || getLocaleFromStorage() || 'es';
  
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(localeToUse);
  const [isUnsupported, setIsUnsupported] = useState(false);

  // Función para cambiar idioma (solo actualiza localStorage e i18n, sin cambiar URL ni recargar)
  const changeLanguage = (code: string) => {
    const isValidLocale = I18N_LANGUAGES.some(lang => lang.code === code);
    
    if (!isValidLocale) {
      console.warn(`Language ${code} is not supported`);
      return;
    }

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', code);
    }

    // Cambiar el idioma en i18n (esto actualiza automáticamente todos los componentes)
    i18n.changeLanguage(code).then(() => {
    setCurrentLocale(code);
    });
  };

  useEffect(() => {
    // Validar locale
    if (localeToUse) {
      const isValidLocale = I18N_LANGUAGES.some(lang => lang.code === localeToUse);
      
      if (!isValidLocale) {
        setIsUnsupported(true);
        setCurrentLocale('es'); // Usar español por defecto si el idioma no está soportado
        if (typeof window !== 'undefined') {
          localStorage.setItem('language', 'es');
        }
        return;
      }
      
      if (currentLocale !== localeToUse) {
        setCurrentLocale(localeToUse);
      }
    }

    // Initialize i18n only on client side
    if (!i18n.isInitialized) {
      const resources = {
        en: { translation: enTranslations },
        es: { translation: esTranslations },
      };

      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'es',
          lng: localeToUse, // Usar locale de localStorage o español por defecto
          debug: process.env.NODE_ENV === 'development',

          interpolation: {
            escapeValue: false, // React already does escaping
          },

          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
          },

          react: {
            useSuspense: false, // Important for Next.js SSR
          },
        })
        .then(() => {
          // Cambiar idioma si es necesario
          if (localeToUse && localeToUse !== i18n.language) {
            i18n.changeLanguage(localeToUse).then(() => {
              setCurrentLocale(localeToUse);
              // Verificar que las traducciones estén cargadas
              if (i18n.hasResourceBundle(localeToUse, 'translation')) {
                setIsI18nInitialized(true);
              } else {
                console.error(`Translations not loaded for locale: ${localeToUse}`);
                setIsI18nInitialized(true);
              }
            });
          } else {
            // Verificar que las traducciones estén cargadas
            const lang = localeToUse || i18n.language || 'es';
            if (i18n.hasResourceBundle(lang, 'translation')) {
              setIsI18nInitialized(true);
            } else {
              console.error(`Translations not loaded for locale: ${lang}`);
          setIsI18nInitialized(true);
            }
          }
        });
    } else {
      // Si ya está inicializado, cambiar idioma si es necesario
      if (localeToUse && localeToUse !== i18n.language) {
        i18n.changeLanguage(localeToUse).then(() => {
          setCurrentLocale(localeToUse);
          setIsI18nInitialized(true);
        }).catch(() => {
          setIsI18nInitialized(true);
        });
      } else {
      setIsI18nInitialized(true);
      }
    }

    // Update document direction when language changes
    const handleLanguageChange = (lng: string) => {
      const language = I18N_LANGUAGES.find((lang) => lang.code === lng);
      if (language?.direction) {
        document.documentElement.setAttribute('dir', language.direction);
      }
    };

    // Set initial direction
    if (i18n.language) {
      handleLanguageChange(i18n.language);
    }

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [localeToUse, currentLocale]);

  // Sincronizar locale cuando cambia
  useEffect(() => {
    if (localeToUse && localeToUse !== currentLocale && isI18nInitialized) {
      setCurrentLocale(localeToUse);
      if (i18n.language !== localeToUse) {
        i18n.changeLanguage(localeToUse);
      }
    }
  }, [localeToUse, currentLocale, isI18nInitialized]);

  // Don't render until i18n is initialized
  if (!isI18nInitialized) {
    return null;
  }

    // Mostrar mensaje si el idioma no está soportado
  if (isUnsupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Idioma no soportado
          </h1>
          <p className="text-muted-foreground">
            Usando español por defecto...
          </p>
        </div>
      </div>
    );
  }

  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === currentLocale) || I18N_LANGUAGES[0];

  return (
    <I18nContext.Provider value={{ locale: currentLocale, changeLanguage, language: currentLanguage }}>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
    </I18nContext.Provider>
  );
}

// Hook para usar el contexto de i18n
export const useLanguage = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    // Fallback si se usa fuera del provider
  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === i18n.language) || I18N_LANGUAGES[0];
    return {
      locale: i18n.language || 'es',
      language: currentLanguage,
      changeLanguage: (code: string) => {
    i18n.changeLanguage(code);
      },
  };
  }

  return context;
};

export { I18nProvider };
