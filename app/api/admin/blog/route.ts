import { prisma } from "@/lib/prisma";
import { APIResponse, getUser } from "@/lib/api-helper";

// GET - Listar posts con paginación (solo para admins)
export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          titleEs: true,
          slugEn: true,
          slugEs: true,
          status: true,
          language: true,
          createdAt: true,
          publishedAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return APIResponse(true, 'Posts obtenidos correctamente', {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/blog:', error);
    return APIResponse(false, 'Error al obtener posts. Por favor, intenta de nuevo.', null, 500);
  }
}

// PATCH - Actualizar status de un post
export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const body = await req.json();
    const { postId, status } = body;

    if (!postId || !status) {
      return APIResponse(false, 'Datos inválidos', null, 400);
    }

    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      return APIResponse(false, 'Status inválido', null, 400);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { 
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      select: {
        id: true,
        titleEn: true,
        titleEs: true,
        status: true,
        publishedAt: true,
      },
    });

    return APIResponse(true, 'Status actualizado correctamente', { post: updatedPost });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/blog:', error);
    return APIResponse(false, 'Error al actualizar status. Por favor, intenta de nuevo.', null, 500);
  }
}

