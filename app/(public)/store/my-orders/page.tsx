'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { MyOrdersContent } from '@/app/(public)/store/my-orders/content';
import { useLanguage } from '@/providers/i18n-provider';

export default function MyOrdersPage() {
  const { locale } = useLanguage();

  return (
    <Fragment>
      {/* My Orders Banner */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}></div>
        </div>
        
        {/* Icono decorativo de fondo */}
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 dark:opacity-10 flex items-center justify-center">
          <Package className="size-48 text-primary" />
        </div>

        <Container className="relative z-10">
          <div className="flex items-center justify-between py-8 md:py-12">
            {/* Título a la izquierda */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {locale === 'es' ? 'Mis Pedidos' : 'My Orders'}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {locale === 'es' 
                  ? 'Ver y gestionar tus pedidos' 
                  : 'View and manage your orders'}
              </p>
            </div>

            {/* Botón a la derecha */}
            <div className="ml-6">
              <Button variant="outline" asChild>
                <Link href="/store" className="flex items-center gap-2">
                  <ShoppingBag className="size-4" />
                  {locale === 'es' ? 'Ir a Tienda' : 'Go to Store'}
                </Link>
              </Button>
            </div>
          </div>
      </Container>
      </div>

      <Container>
        <MyOrdersContent />
      </Container>
    </Fragment>
  );
}
