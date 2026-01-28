import { NextRequest } from 'next/server';
import { APIResponse, getUser } from '@/lib/api-helper';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const dbUser = await getUser();

    if (!dbUser) {
      return APIResponse(false, 'No autorizado', null, 401);
    }

    // Obtener todas las órdenes del usuario (completadas y pendientes)
    const orders = await prisma.order.findMany({
      where: {
        userId: dbUser.id,
        status: {
          in: ['COMPLETED', 'PENDING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
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

    // Enriquecer cartItems con datos completos del producto
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const enrichedCartItems = await Promise.all(
          (order.cartItems as any[]).map(async (item: any) => {
            try {
              const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: {
                  id: true,
                  productType: true,
                  variantFiles: true,
                  images: true,
                  variants: true,
                },
              });
              
              return {
                ...item,
                productType: product?.productType || item.productType,
                variantFiles: product?.variantFiles || null,
                productImages: product?.images || [],
                productVariants: product?.variants || null,
              };
            } catch (error) {
              console.error(`Error fetching product ${item.id}:`, error);
              return item;
            }
          })
        );

        return {
          id: order.id,
          stripeSessionId: order.stripeSessionId,
          status: order.status,
          cartItems: enrichedCartItems,
          subtotal: order.subtotal,
          shipping: order.shipping,
          vat: order.vat,
          total: order.total,
          customerEmail: order.customerEmail,
          completedAt: order.completedAt?.toISOString() || null,
          createdAt: order.createdAt.toISOString(),
          customerName: order.user
            ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
            : null,
        };
      })
    );

    return APIResponse(true, 'Órdenes obtenidas correctamente', {
      orders: ordersWithProducts,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return APIResponse(
      false,
      'Error al obtener las órdenes. Por favor, intenta de nuevo.',
      null,
      500
    );
  }
}

