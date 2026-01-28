'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { ListChecks } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OrderItems } from '@/app/(public)/store/components/common/order-items';
import { useLanguage } from '@/providers/i18n-provider';
import { useStoreClient } from '@/app/(public)/store/components/context';

interface OrderData {
  id: string;
  stripeSessionId?: string;
  status: string;
  cartItems: any[];
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  customerEmail: string | null;
  completedAt: string | null;
  createdAt: string;
  customerName: string | null;
}

export function CheckoutSuccessContent({ sessionId }: { sessionId: string | null }) {
  const { locale } = useLanguage();
  const { handleClearCart } = useStoreClient();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError(locale === 'es' ? 'ID de sesión no encontrado' : 'Session ID not found');
      setIsLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/checkout/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success && data.data?.order) {
          setOrder(data.data.order);
          // Limpiar el carrito después de una compra exitosa (solo una vez)
          if (data.data.order.status === 'COMPLETED' && !cartCleared) {
            handleClearCart();
            setCartCleared(true);
          }
        } else {
          setError(data.message || (locale === 'es' ? 'Error al verificar la orden' : 'Error verifying order'));
        }
      } catch (err) {
        console.error('Error:', err);
        setError(locale === 'es' ? 'Error al verificar la orden' : 'Error verifying order');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">
          {locale === 'es' ? 'Verificando orden...' : 'Verifying order...'}
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-10 text-center">
        <p className="text-destructive">{error || (locale === 'es' ? 'Orden no encontrada' : 'Order not found')}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/store/checkout">
            {locale === 'es' ? 'Volver al checkout' : 'Back to checkout'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="py-10">
        <Card className="px-0 w-full max-w-[800px] mx-auto overflow-hidden">
          <Progress
            value={100}
            className="h-[8px]"
            indicatorClassName="bg-[linear-gradient(90deg,#D618A3_0%,#1951E0_32.67%,#12C79C_67.17%,#DFBB19_100%)]"
          />
          <div
            className="py-10 mb-5 ps-6 pe-3 me-3 text-center space-y-5"
            id="order_receipt_body"
          >
            <div className="flex flex-col items-center gap-3 mb-5 lg:mb-9">
              <h3 className="text-2xl text-dark font-semibold">
                {locale === 'es' ? 'Confirmación de Pedido' : 'Order Confirmation'}
              </h3>
              <span className="text-sm text-secondary-foreground font-medium">
                {locale === 'es' ? '¡Gracias! Tu pedido' : 'Thank you! Your order'}
                <span className="text-sm text-dark font-semibold">
                  {' '}
                  #{order.stripeSessionId 
                    ? `NOMA${order.stripeSessionId.replace(/^cs_test_|^cs_live_/, '').toUpperCase().slice(0, 12)}`
                    : order.id.slice(0, 12).toUpperCase()}{' '}
                </span>
                {locale === 'es' 
                  ? 'está confirmado y siendo procesado.' 
                  : 'is confirmed and being processed.'}
              </span>
            </div>

            <Card className="bg-muted/70 text-start px-5 lg:px-7 py-4">
              <div className="flex justify-start gap-9 flex-wrap">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    {locale === 'es' ? 'Pedido realizado' : 'Order placed'}
                  </span>
                  <span className="text-sm font-medium text-dark">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    {locale === 'es' ? 'Total' : 'Total'}
                  </span>
                  <span className="text-sm font-medium text-dark">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                {order.customerName && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-normal text-secondary-foreground">
                      {locale === 'es' ? 'Enviar a' : 'Ship to'}
                    </span>
                    <span className="text-sm font-medium text-dark">
                      {order.customerName}
                    </span>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-normal text-secondary-foreground">
                      {locale === 'es' ? 'Completado' : 'Completed'}
                    </span>
                    <span className="text-sm font-medium text-dark">
                      {formatDate(order.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-5 lg:pb-5">
              <OrderItems items={order.cartItems as any} />
            </div>

            <Button variant="outline" className="lg:mt-5" asChild>
              <Link href="/store/my-orders">
                <ListChecks />
                {locale === 'es' ? 'Mis Pedidos' : 'My Orders'}
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      <style>
        {`
          body {
            background-color: #F9F9F9;
          }

          .dark body {
            background-color: var(--color-muted-foreground);
          }
        `}
      </style>
    </Fragment>
  );
}

