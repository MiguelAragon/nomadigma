import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { APIResponse, getUser } from '@/lib/api-helper';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

interface CartItem {
  id: string;
  title: string;
  total: string;
  quantity: number;
  sku: string;
  logo?: string;
  productType?: 'PHYSICAL' | 'DIGITAL';
  selectedVariants?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems, discountCode, discountPercentage } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return APIResponse(false, 'El carrito está vacío', null, 400);
    }

    // Obtener usuario autenticado (opcional)
    const clerkUser = await currentUser();
    const customerEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
    const dbUser = await getUser(); // Obtener usuario de la DB (puede ser null)

    // Calcular totales
    let subtotal = cartItems.reduce(
      (sum: number, item: CartItem) => sum + parseFloat(item.total) * item.quantity,
      0
    );
    
    // Aplicar descuento si se proporciona (por ejemplo, 100% = 1.0)
    let discountAmount = 0;
    if (discountPercentage !== undefined && discountPercentage > 0) {
      discountAmount = subtotal * (discountPercentage / 100);
      subtotal = Math.max(0, subtotal - discountAmount); // No permitir valores negativos
    }
    
    // Verificar si hay productos físicos
    const hasPhysicalProducts = cartItems.some(
      (item: CartItem) => item.productType === 'PHYSICAL' || !item.productType
    );
    
    // Shipping calculation - solo si hay productos físicos
    const shipping = hasPhysicalProducts 
      ? (subtotal > 100 ? 0 : 10.0)
      : 0; // No hay envío para productos digitales
    
    const vat = subtotal * 0.1;
    const total = subtotal + shipping + vat;

    // Obtener la URL base del sitio para crear links de productos
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.NEXT_PUBLIC_VERCEL_URL || 
                    'http://localhost:3000';

    // Crear line_items para Stripe
    // Si hay descuento del 100%, los productos serán gratis pero aún aparecerán en el checkout
    const lineItems = cartItems.map((item: CartItem) => {
      let itemPrice = parseFloat(item.total);
      
      // Aplicar descuento al precio del item si existe
      if (discountPercentage !== undefined && discountPercentage > 0) {
        itemPrice = itemPrice * (1 - discountPercentage / 100);
      }
      
      // Preparar imagen del producto (si existe)
      const productImages: string[] = [];
      if (item.logo) {
        // Si la imagen es una URL completa, usarla directamente
        // Si es relativa, convertirla a URL absoluta
        if (item.logo.startsWith('http')) {
          productImages.push(item.logo);
        } else if (item.logo.startsWith('/')) {
          productImages.push(`${baseUrl}${item.logo}`);
        } else {
          // Si es una ruta relativa sin /, construir la URL completa
          productImages.push(`${baseUrl}/media/store/client/600x600/${item.logo}`);
        }
      }
      
      // Crear link del producto
      const productLink = `${baseUrl}/store/products/${item.sku}`;
      
      // Formatear variantes para la descripción (label + value)
      let description = '';
      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        const variantStrings = Object.entries(item.selectedVariants).map(
          ([label, value]) => `${label}: ${value}`
        );
        description = variantStrings.join(', ');
      }
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: description || undefined,
            images: productImages.length > 0 ? productImages : undefined,
            metadata: {
              product_id: item.id,
              product_link: productLink,
              product_sku: item.sku,
            },
          },
          unit_amount: Math.round(itemPrice * 100), // Convertir a centavos
        },
        quantity: item.quantity,
      };
    });

    // Agregar shipping como item adicional si aplica
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Envío',
            description: 'Costo de envío',
            images: [],
            metadata: {
              product_id: 'shipping',
              product_link: '',
              product_sku: 'shipping',
            },
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Agregar VAT como item adicional
    if (vat > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'IVA',
            description: 'Impuesto al Valor Agregado (10%)',
            images: [],
            metadata: {
              product_id: 'vat',
              product_link: '',
              product_sku: 'vat',
            },
          },
          unit_amount: Math.round(vat * 100),
        },
        quantity: 1,
      });
    }

    // Crear sesión de checkout en Stripe
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store/checkout`,
      customer_email: customerEmail || undefined,
      metadata: {
        cartItems: JSON.stringify(cartItems),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        vat: vat.toFixed(2),
        total: total.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        discountPercentage: discountPercentage?.toString() || '0',
      },
    };

    // Si hay un código de descuento, usar cupón de Stripe
    if (discountCode) {
      sessionConfig.discounts = [{ coupon: discountCode }];
    }

    // Si el total es 0 (descuento 100%), permitir checkout sin pago
    if (total === 0) {
      sessionConfig.payment_method_types = [];
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Guardar la orden en la DB ANTES de retornar la URL
    await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        status: 'PENDING',
        cartItems: cartItems as any,
        subtotal,
        shipping,
        vat,
        total,
        customerEmail: customerEmail || null,
        userId: dbUser?.id || null,
      },
    });

    return APIResponse(true, 'Sesión de checkout creada correctamente', {
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return APIResponse(
      false,
      'Error al crear la sesión de pago. Por favor, intenta de nuevo.',
      null,
      500
    );
  }
}

