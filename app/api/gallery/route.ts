import { prisma } from "@/lib/prisma";
import { APIResponse } from "@/lib/api-helper";

// GET - Listar gallery pública con paginación (solo PUBLISHED)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const locale = searchParams.get('locale') || 'es';
    const skip = (page - 1) * limit;

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        where: {
          status: 'PUBLISHED',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          titleEs: true,
          contentEn: true,
          contentEs: true,
          url: true,
          urlThumbnail: true,
          createdAt: true,
        },
      }),
      prisma.gallery.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    return APIResponse(true, 'Galerías obtenidas correctamente', {
      galleries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/gallery:', error);
    return APIResponse(false, 'Error al obtener galerías. Por favor, intenta de nuevo.', null, 500);
  }
}

