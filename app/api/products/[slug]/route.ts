import { prisma } from "@/lib/prisma";
import { APIResponse } from "@/lib/api-helper";
import { notFound } from "next/navigation";

// GET - Obtener producto por slug (público, solo productos activos)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return APIResponse(false, 'Slug es requerido', null, 400);
    }

    // Buscar producto activo por slugEn o slugEs
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slugEn: slug },
          { slugEs: slug },
        ],
        active: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!product) {
      return APIResponse(false, 'Producto no encontrado', null, 404);
    }

    return APIResponse(true, 'Producto obtenido correctamente', product);
  } catch (error: any) {
    console.error('Error in GET /api/products/[slug]:', error);
    return APIResponse(false, 'Error al obtener el producto. Por favor, intenta de nuevo.', null, 500);
  }
}


