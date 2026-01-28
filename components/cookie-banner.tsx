'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';

const COOKIE_CONSENT_KEY = 'nomadigma-cookie-consent';

type CookieConsent = 'accepted' | 'essential' | null;

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => {
    setMounted(true);
    
    // Verificar si ya hay consentimiento guardado
    const checkConsent = () => {
      if (typeof window === 'undefined') return;
      
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsent;
      
      // Solo mostrar el banner si NO hay consentimiento guardado
      if (!consent) {
        // Mostrar banner después de un pequeño delay para mejor UX
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Si ya hay consentimiento, asegurarse de que el banner no se muestre
        setShowBanner(false);
      }
    };

    checkConsent();
  }, []);

  const handleAccept = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
    // Aquí puedes agregar lógica para cargar todas las cookies (analytics, etc.)
  };

  const handleEssentialOnly = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setShowBanner(false);
    // Aquí puedes agregar lógica para cargar solo cookies esenciales
  };

  // No renderizar nada hasta que el componente esté montado (evita problemas de hidratación)
  if (!mounted) return null;
  
  // No mostrar el banner si ya hay consentimiento o si showBanner es false
  if (!showBanner) return null;

  const isSpanish = locale === 'es';

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm bg-background/95">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Icono */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cookie className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {isSpanish ? 'Uso de Cookies' : 'Cookie Usage'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isSpanish
                      ? 'Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. Puedes aceptar todas las cookies o solo las esenciales.'
                      : 'We use cookies to enhance your experience, analyze site traffic, and personalize content. You can accept all cookies or only essential ones.'}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
                  <Button
                    onClick={handleEssentialOnly}
                    variant="outline"
                    className="flex-1 sm:flex-none whitespace-nowrap"
                  >
                    {isSpanish ? 'Solo esenciales' : 'Essential only'}
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none whitespace-nowrap"
                  >
                    {isSpanish ? 'Aceptar todas' : 'Accept all'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

