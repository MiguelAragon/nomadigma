import { prisma } from "@/lib/prisma";
import { APIResponse, getUser, uploadBufferToStorage, getFormValue, translatePost } from "@/lib/api-helper";
import sharp from 'sharp';
import { randomUUID } from 'crypto';

// GET - Listar gallery con paginación (solo para admins)
export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          titleEs: true,
          url: true,
          urlThumbnail: true,
          status: true,
          createdAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.gallery.count(),
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
    console.error('Error in GET /api/admin/gallery:', error);
    return APIResponse(false, 'Error al obtener galerías. Por favor, intenta de nuevo.', null, 500);
  }
}

// PATCH - Actualizar status de una galería
export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const body = await req.json();
    const { galleryId, status } = body;

    if (!galleryId || !status) {
      return APIResponse(false, 'Datos inválidos', null, 400);
    }

    if (!['PUBLISHED', 'ARCHIVED'].includes(status)) {
      return APIResponse(false, 'Status inválido', null, 400);
    }

    const updatedGallery = await prisma.gallery.update({
      where: { id: galleryId },
      data: { status },
      select: {
        id: true,
        titleEn: true,
        titleEs: true,
        status: true,
      },
    });

    return APIResponse(true, 'Status actualizado correctamente', { gallery: updatedGallery });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/gallery:', error);
    return APIResponse(false, 'Error al actualizar status. Por favor, intenta de nuevo.', null, 500);
  }
}

// POST - Crear nueva galería
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    let payload: any = {};
    const uuid = randomUUID();
    const formData = await req.formData();
    
    // Campos en inglés
    const titleEn = getFormValue<string>(formData, 'titleEn');
    const contentEn = getFormValue<string>(formData, 'contentEn');
    
    // Campos en español
    const titleEs = getFormValue<string>(formData, 'titleEs');
    const contentEs = getFormValue<string>(formData, 'contentEs');
    
    // Campos generales
    const language = getFormValue<string>(formData, 'language');
    const imageFile = formData.get('image') as File | null;

    // Validate fields
    if (!language) return APIResponse(false, 'Field language is required', null, 400);
    if (!['es', 'en'].includes(language)) return APIResponse(false, 'Field language is invalid', null, 400);
    if (!imageFile) return APIResponse(false, 'Field image is required', null, 400);

    if ((language === 'en' && !titleEn) || (language === 'en' && !contentEn)) {
      return APIResponse(false, 'Fields titleEn and contentEn are required when language is en', null, 400);
    }
    if ((language === 'es' && !titleEs) || (language === 'es' && !contentEs)) {
      return APIResponse(false, 'Fields titleEs and contentEs are required when language is es', null, 400);
    }

    // Validate image
    if (!imageFile.type || !imageFile.type.startsWith('image/')) {
      return APIResponse(false, 'File must be an image (image/*)', null, 400);
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      return APIResponse(false, 'Image is too large. Maximum 10MB', null, 400);
    }

    // Process image
    try {
      const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload original image
      payload["url"] = await uploadBufferToStorage(
        buffer,
        `gallery/${uuid}.${extension}`,
        imageFile.type
      );

      // Create and upload thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(500, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      payload["urlThumbnail"] = await uploadBufferToStorage(
        thumbnailBuffer,
        `gallery/${uuid}_thumbnail.${extension}`,
        'image/jpeg'
      );
    } catch (error) {
      console.error('Error processing image:', error);
      return APIResponse(false, 'Error processing image', null, 500);
    }

    // Set source language fields
    if (language === 'en') {
      payload["titleEn"] = titleEn;
      payload["contentEn"] = contentEn;
    } else {
      payload["titleEs"] = titleEs;
      payload["contentEs"] = contentEs;
    }

    // Translate to target language
    try {
      const suffixTarget = language === 'en' ? 'Es' : 'En';
      const targetLanguage = language === 'en' ? 'es' : 'en';
      const sourceTitle = language === 'en' ? titleEn : titleEs;
      const sourceContent = language === 'en' ? contentEn : contentEs;
      
      if (sourceTitle && sourceContent) {
        const translation = await translatePost(
          sourceTitle,
          null,
          sourceContent,
          '',
          language as 'en' | 'es',
          targetLanguage as 'en' | 'es'
        );
        
        payload[`title${suffixTarget}`] = translation.title;
        payload[`content${suffixTarget}`] = translation.content;
      }
    } catch (error) {
      console.error('Error translating gallery:', error);
      return APIResponse(false, 'Error processing translation', null, 500);
    }

    payload["status"] = 'PUBLISHED';
    payload["creatorId"] = user.id;

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: payload,
      select: {
        id: true,
        titleEn: true,
        titleEs: true,
        url: true,
        urlThumbnail: true,
        status: true,
        createdAt: true,
      },
    });

    return APIResponse(true, 'Gallery created successfully', {
      id: gallery.id,
      url: gallery.url,
      urlThumbnail: gallery.urlThumbnail,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/gallery:', error);
    return APIResponse(false, 'Error al crear la galería. Por favor, intenta de nuevo.', null, 500);
  }
}

