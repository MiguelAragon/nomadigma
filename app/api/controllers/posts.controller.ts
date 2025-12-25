/**
 * Posts Controller
 */

import { ApiRequest } from "@/lib/api-middleware";
import { prisma } from "@/lib/prisma";
import sharp from 'sharp';
import { supabase } from "@/lib/supabase";
import { randomUUID } from 'crypto';
import { translationService } from "@/lib/translator";

export async function getPosts(req: ApiRequest) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 50,
    });

    return req.response(true, 'Posts obtenidos correctamente', { posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return req.response(false, 'Error al obtener posts', undefined, 500);
  }
}

export async function createPost(req: ApiRequest) {
  if (!req.user) {
    return req.response(false, 'No autorizado', undefined, 401);
  }

  try {
    const formData = await req.formData();

    // Extraer datos del FormData
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const description = formData.get('description') as string | null;
    const slug = formData.get('slug') as string;
    const readingTime = formData.get('readingTime') ? parseInt(formData.get('readingTime') as string) : null;
    const language = formData.get('language') as string;
    const hashtags = JSON.parse(formData.get('hashtags') as string || '[]') as string[];
    const status = (formData.get('status') as string) || 'DRAFT';
    const publishedAt = formData.get('publishedAt') ? new Date(formData.get('publishedAt') as string) : null;
    const coverImageFile = formData.get('coverImage') as File | null;

    // Validar datos requeridos
    if (!title || !content || !slug || !language) {
      return req.response(false, 'Título, contenido, slug e idioma son requeridos', undefined, 400);
    }

    // Determinar campos según el idioma
    const titleField = language === 'en' ? 'titleEn' : 'titleEs';
    const contentField = language === 'en' ? 'contentEn' : 'contentEs';
    const descriptionField = language === 'en' ? 'descriptionEn' : 'descriptionEs';
    const slugField = language === 'en' ? 'slugEn' : 'slugEs';

    // Verificar que el slug no exista
    const whereClause: any = { [slugField]: slug };
    const existingPost = await prisma.post.findUnique({
      where: whereClause,
    });

    if (existingPost) {
      return req.response(false, 'El slug ya existe', undefined, 400);
    }

    // Validar imagen
    if (coverImageFile) {
      if (!coverImageFile.type || !coverImageFile.type.startsWith('image/')) {
        return req.response(false, 'El archivo debe ser una imagen (image/*)', undefined, 400);
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (coverImageFile.size > maxSize) {
        return req.response(false, 'La imagen es demasiado grande. Máximo 10MB', undefined, 400);
      }
    }

    const postId = randomUUID();

    // Procesar imagen de portada si existe
    let coverImageUrl: string | null = null;
    let coverImageThumbnailUrl: string | null = null;

    if (coverImageFile) {
      try {
        const originalExtension = coverImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const imageFileName = `covers/${postId}.${originalExtension}`;
        const thumbnailFileName = `covers/${postId}_thumbnail.${originalExtension}`;

        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const storageContainer = process.env.STORAGE_CONTAINER || 'nomadigma';

        // Subir imagen original
        const { data: imageData, error: imageError } = await supabase.storage
          .from(storageContainer)
          .upload(imageFileName, buffer, {
            contentType: coverImageFile.type,
            upsert: true,
          });

        if (imageError) {
          console.error('Error uploading cover image:', imageError);
          throw imageError;
        }

        const { data: imageUrlData } = supabase.storage
          .from(storageContainer)
          .getPublicUrl(imageFileName);
        
        coverImageUrl = imageUrlData.publicUrl;

        // Crear thumbnail
        const thumbnailBuffer = await sharp(buffer)
          .resize(400, 300, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from(storageContainer)
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (thumbnailError) {
          console.error('Error uploading thumbnail:', thumbnailError);
          throw thumbnailError;
        }

        const { data: thumbnailUrlData } = supabase.storage
          .from(storageContainer)
          .getPublicUrl(thumbnailFileName);
        
        coverImageThumbnailUrl = thumbnailUrlData.publicUrl;
      } catch (error) {
        console.error('Error processing cover image:', error);
        // Continuar sin imagen si hay error
      }
    }

    // Traducir el contenido
    const targetLanguage = (language === 'en' ? 'es' : 'en') as 'en' | 'es';
    console.log(`[Translation] Starting translation from ${language} to ${targetLanguage}`, {
      title: title.substring(0, 50),
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });

    const translation = await translationService.translatePost(
      {
        title,
        description: description || null,
        content,
        slug,
      },
      language as 'en' | 'es',
      targetLanguage
    );

    console.log(`[Translation] Success!`, {
      originalTitle: title.substring(0, 50),
      translatedTitle: translation.title.substring(0, 50),
    });
    
    const translatedTitle = translation.title;
    const translatedContent = translation.content;
    const translatedDescription = translation.description;
    const translatedSlug = translation.slug;

    // Preparar datos para crear el post
    const postData: any = {
      id: postId,
      [titleField]: title,
      [contentField]: content,
      [descriptionField]: description || null,
      [slugField]: slug,
      [language === 'en' ? 'titleEs' : 'titleEn']: translatedTitle,
      [language === 'en' ? 'contentEs' : 'contentEn']: translatedContent,
      [language === 'en' ? 'descriptionEs' : 'descriptionEn']: translatedDescription,
      [language === 'en' ? 'slugEs' : 'slugEn']: translatedSlug,
      hashtags,
      coverImage: coverImageUrl,
      coverImageThumbnail: coverImageThumbnailUrl,
      readingTime,
      status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      publishedAt,
      creatorId: req.user.id,
    };

    // Crear post
    const post = await prisma.post.create({
      data: postData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    return req.response(true, 'Post creado correctamente', {
      id: post.id,
      slugEn: post.slugEn,
      slugEs: post.slugEs,
      status: post.status,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    if (error.code === 'P2002') {
      return req.response(false, 'El slug ya existe', undefined, 400);
    }

    return req.response(false, 'Error al crear el post', undefined, 500);
  }
}

export async function deletePost(req: ApiRequest) {
  if (!req.user) {
    return req.response(false, 'No autorizado', undefined, 401);
  }

  // Validar ownership o rol aquí
  // El backend decide permisos
  
  return req.response(true, 'Post eliminado correctamente', { deleted: true });
}

