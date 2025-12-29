import { prisma } from "@/lib/prisma";
import { APIResponse, getUser } from "@/lib/api-helper";

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    // Obtener parámetros de paginación
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Obtener usuarios con paginación
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          role: true,
          createdAt: true,
          lastSignInAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return APIResponse(true, 'Usuarios obtenidos correctamente', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    return APIResponse(false, 'Error al obtener usuarios. Por favor, intenta de nuevo.', null, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return APIResponse(false, 'Datos inválidos', null, 400);
    }

    if (role !== 'USER' && role !== 'ADMIN') {
      return APIResponse(false, 'Rol inválido', null, 400);
    }

    // No permitir que el admin se cambie su propio rol
    if (userId === user.id) {
      return APIResponse(false, 'No puedes cambiar tu propio rol', null, 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return APIResponse(true, 'Rol actualizado correctamente', { user: updatedUser });
  } catch (error: any) {
    console.error('Error in PATCH /api/users:', error);
    return APIResponse(false, 'Error al actualizar rol. Por favor, intenta de nuevo.', null, 500);
  }
}

