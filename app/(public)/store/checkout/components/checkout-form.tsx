'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStoreClient } from '@/app/(public)/store/components/context';
import { useLanguage } from '@/providers/i18n-provider';

interface CheckoutFormData {
  fullName: string;
  email: string;
  // Campos para productos físicos
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

export function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const { state } = useStoreClient();
  const { locale } = useLanguage();
  
  // Verificar si hay productos físicos en el carrito
  const hasPhysicalProducts = state.cartItems.some(
    item => item.productType === 'PHYSICAL' || !item.productType
  );

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.fullName.trim() || !formData.email.trim()) {
      return;
    }

    // Si hay productos físicos, validar campos de envío
    if (hasPhysicalProducts) {
      if (!formData.street?.trim() || 
          !formData.city?.trim() || 
          !formData.state?.trim() || 
          !formData.postalCode?.trim() || 
          !formData.country?.trim()) {
        return;
      }
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    // Actualizar el estado del padre en tiempo real
    onSubmit(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {locale === 'es' ? 'Información de Envío' : 'Shipping Information'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre completo - Siempre requerido */}
          <div>
            <Label htmlFor="fullName" className="mb-2 block">
              {locale === 'es' ? 'Nombre Completo' : 'Full Name'} *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email - Siempre requerido */}
          <div>
            <Label htmlFor="email" className="mb-2 block">
              {locale === 'es' ? 'Email' : 'Email'} *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Campos de dirección para productos físicos */}
          <div>
            <Label htmlFor="street" className="mb-2 block">
              {locale === 'es' ? 'Calle' : 'Street'} *
            </Label>
            <Input
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="mb-2 block">
                {locale === 'es' ? 'Ciudad' : 'City'} *
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="state" className="mb-2 block">
                {locale === 'es' ? 'Estado' : 'State'} *
              </Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode" className="mb-2 block">
                {locale === 'es' ? 'Código Postal' : 'Postal Code'} *
              </Label>
              <Input
                id="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="country" className="mb-2 block">
                {locale === 'es' ? 'País' : 'Country'} *
              </Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block">
              {locale === 'es' ? 'Teléfono' : 'Phone'} ({locale === 'es' ? 'Opcional' : 'Optional'})
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

