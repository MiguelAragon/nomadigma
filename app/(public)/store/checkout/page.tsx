'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { BaggageClaim, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { CheckoutContent } from '@/app/(public)/store/checkout/content';
import { useLanguage } from '@/providers/i18n-provider';
import { useAuth } from '@/hooks/use-auth';

export default function CheckoutPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();

  return (
    <Fragment>
      {/* Checkout Banner */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}></div>
        </div>
        
        {/* Icono decorativo de fondo */}
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 dark:opacity-10 flex items-center justify-center">
          <ShoppingCart className="size-48 text-primary" />
        </div>

        <Container className="relative z-10">
          <div className="flex items-center justify-between py-8 md:py-12">
            {/* Título a la izquierda */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Checkout
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {locale === 'es' 
                  ? 'Revisa tus artículos antes de finalizar la compra' 
                  : 'Review your items before checkout'}
              </p>
            </div>

            {/* Botones a la derecha */}
            <div className="ml-6 flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/store" className="flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  {locale === 'es' ? 'Seguir Comprando' : 'Continue Shopping'}
                </Link>
              </Button>
              {/* Solo mostrar "Mis Pedidos" si el usuario está logueado */}
              {user && (
                <Button variant="outline" asChild>
                  <Link href="/store/my-orders" className="flex items-center gap-2">
                    <BaggageClaim className="size-4" />
                    {locale === 'es' ? 'Mis Pedidos' : 'My Orders'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <CheckoutContent />
      </Container>
    </Fragment>
  );
}

