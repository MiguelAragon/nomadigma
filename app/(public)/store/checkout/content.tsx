'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { CreditCard, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/app/(public)/store/checkout/components/order';
import { Card4 } from '@/app/(public)/store/components/common/card4';
import { CheckoutForm } from '@/app/(public)/store/checkout/components/checkout-form';
import { useLanguage } from '@/providers/i18n-provider';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { UserPlus, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CheckoutFormData {
  fullName: string;
  email: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

// Componente separado para el formulario de contacto digital (evita re-renders de Card4)
const DigitalContactForm = memo(({ 
  formData, 
  onFormSubmit, 
  isLoading, 
  locale 
}: { 
  formData: CheckoutFormData | null; 
  onFormSubmit: (data: CheckoutFormData) => void; 
  isLoading: boolean;
  locale: string;
}) => {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">
        {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="digital-fullName" className="mb-2 block">
            {locale === 'es' ? 'Nombre Completo' : 'Full Name'} *
          </Label>
          <Input
            id="digital-fullName"
            type="text"
            value={formData?.fullName || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormSubmit({
              fullName: e.target.value,
              email: formData?.email || '',
            })}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="digital-email" className="mb-2 block">
            {locale === 'es' ? 'Email' : 'Email'} *
          </Label>
          <Input
            id="digital-email"
            type="email"
            value={formData?.email || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormSubmit({
              fullName: formData?.fullName || '',
              email: e.target.value,
            })}
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
});

export function CheckoutContent() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const { state, handleClearCart, cartTotal } = useStoreClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleFormSubmit = useCallback((data: CheckoutFormData) => {
    setFormData(data);
  }, []);

  const handleCheckout = async () => {
    if (state.cartItems.length === 0) {
      return;
    }

    // Si hay productos físicos, validar campos requeridos
    const hasPhysicalProducts = state.cartItems.some(
      item => item.productType === 'PHYSICAL' || !item.productType
    );
    
    if (hasPhysicalProducts) {
      // Para productos físicos, validar nombre, email y dirección
      if (!formData || !formData.fullName.trim() || !formData.email.trim()) {
        toast.error(locale === 'es' 
          ? 'Por favor completa todos los campos requeridos' 
          : 'Please fill in all required fields');
        return;
      }
      
      if (!formData.street?.trim() || 
          !formData.city?.trim() || 
          !formData.state?.trim() || 
          !formData.postalCode?.trim() || 
          !formData.country?.trim()) {
        toast.error(locale === 'es' 
          ? 'Por favor completa todos los campos de envío' 
          : 'Please fill in all shipping fields');
        return;
      }
    }
    // Para productos digitales, no se requiere nombre ni email

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: state.cartItems,
          customerInfo: hasPhysicalProducts ? formData : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.data.url;
      } else {
        console.error('Error creating checkout session:', data.message);
        toast.error(locale === 'es' 
          ? 'Error al procesar el pago. Por favor, intenta de nuevo.' 
          : 'Error processing payment. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(locale === 'es' 
        ? 'Error al procesar el pago. Por favor, intenta de nuevo.' 
        : 'Error processing payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si hay productos físicos (memoizado para evitar re-renders)
  const hasPhysicalProducts = useMemo(() => 
    state.cartItems.some(
      item => item.productType === 'PHYSICAL' || !item.productType
    ),
    [state.cartItems]
  );

  // Validar si el formulario está completo
  const isFormValid = () => {
    // Para productos digitales, no se requiere validación de formulario
    if (!hasPhysicalProducts) {
      return true;
    }
    
    // Para productos físicos, validar nombre, email y dirección
    if (!formData || !formData.fullName.trim() || !formData.email.trim()) {
      return false;
    }
    
    if (!formData.street?.trim() || 
        !formData.city?.trim() || 
        !formData.state?.trim() || 
        !formData.postalCode?.trim() || 
        !formData.country?.trim()) {
      return false;
    }
    
    return true;
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    handleClearCart();
    setShowCancelDialog(false);
    toast.success(locale === 'es' 
      ? 'Compra cancelada. El carrito ha sido vaciado.' 
      : 'Purchase cancelled. Cart has been cleared.');
    router.push('/store');
  };

  // Calcular información del carrito para mostrar en el diálogo (memoizado para evitar re-renders)
  const cartInfo = useMemo(() => ({
    totalItems: state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (cartTotal || 0).toFixed(2),
    productNames: state.cartItems.map(item => item.title),
  }), [state.cartItems, cartTotal]);

  // Key estable para Card4 basada en los items del carrito (solo cambia si cambian los items)
  const cartItemsKey = useMemo(() => 
    state.cartItems.map(i => i.id).join('-'), 
    [state.cartItems]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="col-span-2 space-y-5">
        {/* Items del carrito - Key estable basada en items para evitar re-renders */}
        <div className="grid sm:grid-cols-1 gap-5">
          <Card4 key={cartItemsKey} limit={4} />
        </div>
        
        {/* Si el usuario NO está logueado, mostrar componente de registro */}
        {!user ? (
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="rounded-full bg-primary/10 p-4">
                  <UserPlus className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  {locale === 'es' ? 'Regístrate para continuar' : 'Sign up to continue'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {locale === 'es' 
                    ? 'Es importante registrarte para mantener la información de tus compras y tener acceso completo a la plataforma.'
                    : 'It\'s important to sign up to keep your purchase information and have full access to the platform.'}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    {locale === 'es' 
                      ? 'Mantén un historial de todas tus compras'
                      : 'Keep a history of all your purchases'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    {locale === 'es' 
                      ? 'Acceso completo a la plataforma y sus funcionalidades'
                      : 'Full access to the platform and its features'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    {locale === 'es' 
                      ? 'Gestiona tus pedidos desde un solo lugar'
                      : 'Manage your orders from one place'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Button asChild className="w-full mt-2" size="lg">
                  <Link href="/signup">
                    <UserPlus className="size-4 mr-2" />
                    {locale === 'es' ? 'Registrarse ahora' : 'Sign up now'}
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {locale === 'es' 
                    ? '¿Ya tienes una cuenta?'
                    : 'Already have an account?'}{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    {locale === 'es' ? 'Inicia sesión' : 'Sign in'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Formulario de checkout - Solo para productos físicos */}
            {hasPhysicalProducts && (
              <CheckoutForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            )}
            
            {/* Botones de acción - Solo mostrar si hay productos en el carrito */}
            {state.cartItems.length > 0 && (
              <div className="flex justify-end items-center flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancelClick}
                  disabled={isLoading}
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={isLoading || state.cartItems.length === 0 || !isFormValid()}
                >
                  <CreditCard className="size-4" />
                  {isLoading 
                    ? (locale === 'es' ? 'Procesando...' : 'Processing...')
                    : (locale === 'es' ? 'Pagar ahora' : 'Checkout now')
                  }
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="col-span-1">
        <div className="space-y-5">
          <Order />
        </div>
      </div>

      {/* Diálogo de confirmación para cancelar */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              {locale === 'es' ? '¿Deseas cancelar la compra?' : 'Do you want to cancel the purchase?'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es' 
                ? 'Esta acción eliminará todos los productos del carrito y perderás la información ingresada.'
                : 'This action will remove all products from the cart and you will lose the entered information.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-3 text-sm">
                {locale === 'es' ? 'Resumen del carrito:' : 'Cart summary:'}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {locale === 'es' ? 'Total de productos:' : 'Total products:'}
                  </span>
                  <span className="font-medium">{cartInfo.totalItems}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {locale === 'es' ? 'Total:' : 'Total:'}
                  </span>
                  <span className="font-medium">${cartInfo.totalPrice}</span>
                </div>

                {cartInfo.productNames.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-muted-foreground text-xs block mb-2">
                      {locale === 'es' ? 'Productos:' : 'Products:'}
                    </span>
                    <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {cartInfo.productNames.map((name, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              {locale === 'es' ? 'No, continuar' : 'No, continue'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
            >
              <X className="size-4 mr-2" />
              {locale === 'es' ? 'Sí, cancelar compra' : 'Yes, cancel purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

