import { prisma } from "@/lib/prisma";
import { APIResponse } from "@/lib/api-helper";
import { CATEGORY_SHOP } from "@/config/categories";

// GET - Obtener productos con filtros (público, solo productos activos)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir el where clause
    const where: any = {
      active: true,
    };

    // Filtro por categoría (puede venir separado por comas)
    if (category) {
      const categoryList = category.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
      if (categoryList.length > 0) {
        // Validar que las categorías existan en el catálogo
        const validCategories = categoryList.filter(cat => cat in CATEGORY_SHOP);
        
        if (validCategories.length > 0) {
          where.category = {
            in: validCategories,
          };
        }
      }
    }

    // Filtro por búsqueda (busca en título en ambos idiomas)
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleEs: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { descriptionEs: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Ordenamiento
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Obtener productos y total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Mapear productos al formato esperado
    const mappedProducts = products.map((product: any) => ({
      id: product.id,
      slugEn: product.slugEn || null,
      slugEs: product.slugEs || null,
      titleEn: product.titleEn,
      titleEs: product.titleEs,
      descriptionEn: product.descriptionEn,
      isOnSale: product.isOnSale || false,
      discountPercentage: product.discountPercentage || null,
      productType: product.productType || 'PHYSICAL',
      hasShippingCost: product.hasShippingCost || false,
      shippingCost: product.shippingCost || null,
      descriptionEs: product.descriptionEs,
      category: product.category,
      price: product.price,
      images: product.images || [],
      variants: product.variants,
      active: product.active,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      creator: {
        id: product.creator.id,
        name: `${product.creator.firstName || ''} ${product.creator.lastName || ''}`.trim() || 'Anonymous',
        email: product.creator.email,
        avatar: product.creator.imageUrl || undefined,
      },
    }));

    return APIResponse(true, 'Productos obtenidos correctamente', {
      products: mappedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    return APIResponse(false, 'Error al obtener productos. Por favor, intenta de nuevo.', null, 500);
  }
}

