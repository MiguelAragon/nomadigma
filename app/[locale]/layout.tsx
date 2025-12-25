'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { I18nProvider } from '@/providers/i18n-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Detectar si estamos en páginas de autenticación
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup');
  
  // Si no está montado, renderizar sin layout para evitar flash
  if (!mounted) {
    return null;
  }
  
  // Si es página de autenticación, NO mostrar header y footer
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
