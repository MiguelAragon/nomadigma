'use client';

import { memo, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { useLanguage } from '@/providers/i18n-provider';

export interface IOrderItem {
  label: string;
  amount: number;
}
export type IOrderItems = Array<IOrderItem>;

const OrderComponent = () => {
  const { state } = useStoreClient();
  const { locale } = useLanguage();
  const cartItems = state.cartItems;

  // Calculate subtotal from cart items (memoizado)
  const subtotal = useMemo(() => cartItems.reduce(
    (sum, item) => sum + parseFloat(item.total) * item.quantity,
    0
  ), [cartItems]);

  // Verificar si hay productos físicos (memoizado)
  const hasPhysicalProducts = useMemo(() => 
    cartItems.some(item => item.productType === 'PHYSICAL' || !item.productType),
    [cartItems]
  );

  // Shipping calculation - solo si hay productos físicos (memoizado)
  const shipping = useMemo(() => {
    if (!hasPhysicalProducts) return 0; // No hay envío para productos digitales
    return subtotal > 100 ? 0 : 10.0;
  }, [subtotal, hasPhysicalProducts]);

  // VAT calculation (10% of subtotal) (memoizado)
  const vat = useMemo(() => subtotal * 0.1, [subtotal]);

  // Total calculation (memoizado)
  const total = useMemo(() => subtotal + shipping + vat, [subtotal, shipping, vat]);

  // Solo incluir envío en los items si hay productos físicos
  const items: IOrderItems = useMemo(() => {
    const orderItems: IOrderItems = [
      { label: locale === 'es' ? 'Subtotal' : 'Subtotal', amount: subtotal },
    ];
    
    // Solo agregar envío si hay productos físicos
    if (hasPhysicalProducts) {
      orderItems.push({ label: locale === 'es' ? 'Envío' : 'Shipping', amount: shipping });
    }
    
    orderItems.push({ label: locale === 'es' ? 'IVA' : 'VAT', amount: vat });
    
    return orderItems;
  }, [subtotal, shipping, vat, hasPhysicalProducts, locale]);

  const renderItem = (item: IOrderItem, index: number) => (
    <div key={index} className="flex justify-between items-center">
      <span className="text-sm font-normal text-secondary-foreground">
        {item.label}
      </span>
      <span className="text-sm font-medium text-mono">
        ${item.amount.toFixed(2)}
      </span>
    </div>
  );

  return (
    <Card className="bg-accent/50 pb-5">
      <CardHeader className="px-5">
        <CardTitle>
          {locale === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 py-4 space-y-2">
        <h4 className="text-sm font-medium text-mono mb-3.5">
          {locale === 'es' ? 'Detalles del Precio' : 'Price Details'}
        </h4>

        {items.map((item, index) => {
          return renderItem(item, index);
        })}
      </CardContent>

      <CardFooter className="flex justify-between items-center px-5 pb-5">
        <span className="text-sm font-normal text-secondary-foreground">
          {locale === 'es' ? 'Total' : 'Total'}
        </span>
        <span className="text-base font-semibold text-mono">
          ${total.toFixed(2)}
        </span>
      </CardFooter>
    </Card>
  );
};

// Memoizar el componente Order para evitar re-renders innecesarios
export const Order = memo(OrderComponent);

