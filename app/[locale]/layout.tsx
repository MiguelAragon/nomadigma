'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  
  // Validar que el locale sea válido
  const locale = params.locale as string;
  if (locale !== 'en' && locale !== 'es') {
    notFound();
  }
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Si no está montado, renderizar sin layout para evitar flash
  if (!mounted) return null;
  
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
