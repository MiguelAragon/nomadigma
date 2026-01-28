'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderItems } from '@/app/(public)/store/components/common/order-items';
import { useLanguage } from '@/providers/i18n-provider';

interface Order {
  id: string;
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

export function MyOrders() {
  const { locale } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();

        if (response.ok && data.success && data.data?.orders) {
          setOrders(data.data.orders);
        } else {
          if (response.status === 401) {
            setError(locale === 'es' ? 'Debes iniciar sesión para ver tus pedidos' : 'You must sign in to view your orders');
          } else {
            setError(data.message || (locale === 'es' ? 'Error al cargar las órdenes' : 'Error loading orders'));
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(locale === 'es' ? 'Error al cargar las órdenes' : 'Error loading orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">{locale === 'es' ? 'Completado' : 'Completed'}</Badge>;
      case 'PENDING':
        return <Badge variant="outline">{locale === 'es' ? 'Pendiente' : 'Pending'}</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">{locale === 'es' ? 'Cancelado' : 'Cancelled'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">
          {locale === 'es' ? 'Cargando pedidos...' : 'Loading orders...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">
          {locale === 'es' ? 'No tienes pedidos aún' : 'You have no orders yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-1 gap-5 lg:gap-9">
      {orders.map((order) => (
        <Card key={order.id} className="lg:col-span-1">
          <CardHeader className="justify-start bg-muted/70 gap-9 h-auto py-5 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                {locale === 'es' ? 'ID de Pedido' : 'Order ID'}
              </span>
              <span className="text-sm font-medium text-mono">
                #{order.id.slice(0, 12).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                {locale === 'es' ? 'Estado' : 'Status'}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                {locale === 'es' ? 'Pedido realizado' : 'Order placed'}
              </span>
              <span className="text-sm font-medium text-mono">
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                {locale === 'es' ? 'Total' : 'Total'}
              </span>
              <span className="text-sm font-medium text-mono">
                ${order.total.toFixed(2)}
              </span>
            </div>
            {order.customerName && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                  {locale === 'es' ? 'Enviar a' : 'Ship to'}
              </span>
              <span className="text-sm font-medium text-mono">
                  {order.customerName}
              </span>
            </div>
            )}
            {order.completedAt && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                  {locale === 'es' ? 'Completado' : 'Completed'}
              </span>
              <span className="text-sm font-medium text-mono">
                  {formatDate(order.completedAt)}
              </span>
            </div>
            )}
          </CardHeader>
          <CardContent className="p-5 lg:p-7.5 space-y-5">
            <OrderItems items={order.cartItems as any} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
