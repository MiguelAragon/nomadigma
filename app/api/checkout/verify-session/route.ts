import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { APIResponse } from '@/lib/api-helper';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return APIResponse(false, 'session_id es requerido', null, 400);
    }

    // Buscar la orden en la DB
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return APIResponse(false, 'Orden no encontrada', null, 404);
    }

    // Si la orden ya está completada, retornar los datos (sin re-enviar email)
    if (order.status === 'COMPLETED') {
      // Obtener datos completos de productos para incluir variantFiles
      const cartItemsWithProducts = await Promise.all(
        (order.cartItems as any[]).map(async (item: any) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.id },
              select: {
                id: true,
                productType: true,
                variantFiles: true,
                images: true,
              },
            });
            
            return {
              ...item,
              productType: product?.productType || item.productType,
              variantFiles: product?.variantFiles || null,
              productImages: product?.images || [],
            };
          } catch (error) {
            console.error(`Error fetching product ${item.id}:`, error);
            return item;
          }
        })
      );

      return APIResponse(true, 'Orden completada', {
        order: {
          id: order.id,
          stripeSessionId: order.stripeSessionId,
          status: order.status,
          cartItems: cartItemsWithProducts,
          subtotal: order.subtotal,
          shipping: order.shipping,
          vat: order.vat,
          total: order.total,
          customerEmail: order.customerEmail,
          completedAt: order.completedAt,
          createdAt: order.createdAt,
          customerName: order.user
            ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
            : null,
        },
      });
    }

    // Verificar el estado de la sesión en Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Si el pago fue exitoso, actualizar la orden
    if (session.payment_status === 'paid' && order.status === 'PENDING') {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Obtener datos completos de productos para el email (incluyendo variantFiles)
      const cartItemsWithProducts = await Promise.all(
        (updatedOrder.cartItems as any[]).map(async (item: any) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.id },
              select: {
                id: true,
                productType: true,
                variantFiles: true,
                images: true,
              },
            });
            
            return {
              ...item,
              productType: product?.productType || item.productType,
              variantFiles: product?.variantFiles || null,
              productImages: product?.images || [],
            };
          } catch (error) {
            console.error(`Error fetching product ${item.id}:`, error);
            return item;
          }
        })
      );

      // Enviar correo de confirmación
      await sendOrderConfirmationEmail({
        orderId: updatedOrder.id,
        stripeSessionId: updatedOrder.stripeSessionId,
        customerName: updatedOrder.user
          ? `${updatedOrder.user.firstName || ''} ${updatedOrder.user.lastName || ''}`.trim()
          : null,
        customerEmail: updatedOrder.customerEmail,
        cartItems: cartItemsWithProducts,
        subtotal: updatedOrder.subtotal,
        shipping: updatedOrder.shipping,
        vat: updatedOrder.vat,
        total: updatedOrder.total,
        createdAt: updatedOrder.createdAt.toISOString(),
        locale: 'es', // Puedes detectar el idioma del usuario si lo tienes disponible
      });

      return APIResponse(true, 'Orden completada exitosamente', {
        order: {
          id: updatedOrder.id,
          stripeSessionId: updatedOrder.stripeSessionId,
          status: updatedOrder.status,
          cartItems: cartItemsWithProducts,
          subtotal: updatedOrder.subtotal,
          shipping: updatedOrder.shipping,
          vat: updatedOrder.vat,
          total: updatedOrder.total,
          customerEmail: updatedOrder.customerEmail,
          completedAt: updatedOrder.completedAt,
          createdAt: updatedOrder.createdAt,
          customerName: updatedOrder.user
            ? `${updatedOrder.user.firstName || ''} ${updatedOrder.user.lastName || ''}`.trim()
            : null,
        },
      });
    }

    // Si el pago no fue exitoso, retornar el estado actual con variantFiles
    const cartItemsWithProductsPending = await Promise.all(
      (order.cartItems as any[]).map(async (item: any) => {
        try {
          const product = await prisma.product.findUnique({
            where: { id: item.id },
            select: {
              id: true,
              productType: true,
              variantFiles: true,
              images: true,
            },
          });
          
          return {
            ...item,
            productType: product?.productType || item.productType,
            variantFiles: product?.variantFiles || null,
            productImages: product?.images || [],
          };
        } catch (error) {
          console.error(`Error fetching product ${item.id}:`, error);
          return item;
        }
      })
    );

    return APIResponse(true, 'Orden pendiente', {
      order: {
        id: order.id,
        stripeSessionId: order.stripeSessionId,
        status: order.status,
        cartItems: cartItemsWithProductsPending,
        subtotal: order.subtotal,
        shipping: order.shipping,
        vat: order.vat,
        total: order.total,
        customerEmail: order.customerEmail,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
        customerName: order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    return APIResponse(
      false,
      'Error al verificar la sesión de pago. Por favor, intenta de nuevo.',
      null,
      500
    );
  }
}

