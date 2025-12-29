import { getFormValue, getUser, APIResponse, uploadBufferToStorage, translatePost } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    // Si hay slug, devolver un solo post
    if (slug) {
      const locale = searchParams.get('locale') || 'es';
      const forEdit = searchParams.get('forEdit') === 'true'; // Flag para saber si es para editar
      console.log('GET /api/posts - Looking for slug:', slug, 'locale:', locale, 'forEdit:', forEdit);

      const post = await prisma.post.findFirst({
        where: {
          OR: [
            { slugEn: slug },
            { slugEs: slug }
          ],
          // Si es para editar, no filtrar por status (puede estar en DRAFT)
          ...(forEdit ? {} : { status: 'PUBLISHED' }),
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
      });

      if (!post) {
        return APIResponse(false, 'Post not found', null, 404);
      }

      // Si es para editar, devolver el post completo con todos los campos
      if (forEdit) {
        const fullPost = {
          id: post.id,
          titleEn: post.titleEn || '',
          titleEs: post.titleEs || '',
          contentEn: post.contentEn || '',
          contentEs: post.contentEs || '',
          descriptionEn: post.descriptionEn || '',
          descriptionEs: post.descriptionEs || '',
          slugEn: post.slugEn || '',
          slugEs: post.slugEs || '',
          coverImage: post.coverImage || null,
          hashtags: post.hashtags || [],
          language: post.language || 'en',
          readingTime: post.readingTime || 0,
          publishedAt: post.publishedAt?.toISOString() || null,
        };
        return APIResponse(true, 'Post retrieved successfully', fullPost);
      }

      // Si no es para editar, devolver el formato mapeado para visualización
      const title = locale === 'en' ? post.titleEn : post.titleEs;
      const slugValue = locale === 'en' ? post.slugEn : post.slugEs;
      const description = locale === 'en' ? post.descriptionEn : post.descriptionEs;
      const content = locale === 'en' ? post.contentEn : post.contentEs;
      
      const mappedPost = {
        id: post.id,
        slug: slugValue,
        title,
        excerpt: description || (content ? content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''),
        content,
        publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
        viewCount: post.viewCount,
        author: {
          name: `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim() || 'Anonymous',
          avatar: post.creator.imageUrl || undefined,
          bio: null,
        },
        categories: [],
        hashtags: post.hashtags || [],
        attachments: post.coverImage ? [{
          id: 0,
          url: post.coverImage,
          type: 'image' as const
        }] : [],
        likes: post.likeCount,
        comments: post.commentCount,
        readingTime: post.readingTime,
      };

      return APIResponse(true, 'Post retrieved successfully', mappedPost);
    }

    // Si no hay slug, devolver lista de posts publicados con paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const locale = searchParams.get('locale') || 'es';
    
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    // Mapear posts al formato esperado
    const mappedPosts = posts.map(post => {
      const title = locale === 'en' ? post.titleEn : post.titleEs;
      const slug = locale === 'en' ? post.slugEn : post.slugEs;
      const description = locale === 'en' ? post.descriptionEn : post.descriptionEs;
      const content = locale === 'en' ? post.contentEn : post.contentEs;
      
      // Extraer excerpt de description o content
      const excerpt = description || (content ? content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '');
      
      // Convert UUID to numeric ID for compatibility
      const numericId = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      return {
        id: numericId,
        slug,
        title,
        excerpt,
        content,
        publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
        viewCount: post.viewCount,
        author: {
          name: `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim() || 'Anonymous',
          avatar: post.creator.imageUrl || undefined,
          bio: null, // Por ahora null, se puede agregar después si se añade el campo al modelo User
        },
        categories: [], // Por ahora vacío, se puede agregar después
        hashtags: post.hashtags || [],
        attachments: post.coverImage ? [{
          id: 1,
          url: post.coverImageThumbnail || post.coverImage,
          type: 'image' as const,
        }] : [],
        likes: post.likeCount,
        comments: post.commentCount,
        readingTime: post.readingTime || 0,
      };
    });

    return Response.json({ 
      posts: mappedPosts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if(!user) return APIResponse(false, 'No autorizado', null, 401);
    let payload: any = {};

    //Extract data from the form
    let uuid = randomUUID();
    const formData = await req.formData();
    let existingPost: any = null;
    
    // Campos en inglés
    const titleEn = getFormValue<string>(formData, 'titleEn');
    const contentEn = getFormValue<string>(formData, 'contentEn');
    const descriptionEn = getFormValue<string>(formData, 'descriptionEn');
    const slugEn = getFormValue<string>(formData, 'slugEn');

    // Campos en español
    const titleEs = getFormValue<string>(formData, 'titleEs');
    const contentEs = getFormValue<string>(formData, 'contentEs');
    const descriptionEs = getFormValue<string>(formData, 'descriptionEs');
    const slugEs = getFormValue<string>(formData, 'slugEs');
    
    //Campos generales 
    const language = getFormValue<string>(formData, 'language');
    const readingTime = getFormValue<number>(formData, 'readingTime', { parse: v => parseInt(v) })
    const hashtags = getFormValue<string[]>(formData, 'hashtags', { parse: v => JSON.parse(v), default: []})
    const status = getFormValue<string>(formData, 'status') ?? 'DRAFT'
    const coverImageFile = formData.get('coverImage') as File | null

    const postId = getFormValue<string>(formData, 'postId');
    const translate = getFormValue<string>(formData, 'translate');
    
    // Si es creación, translate se setea como el contrario de language
    // Si es edición, translate viene del formulario
    const shouldTranslate = postId 
      ? translate === 'true' 
      : true; // En creación siempre traducir

    //Validate fields 
    if(!language) return APIResponse(false, 'Field language is required', null, 400);
    if(readingTime === null) return APIResponse(false, 'Field readingTime is required', null, 400);
    if(!status) return APIResponse(false, 'Field status is required', null, 400);
    if(!postId && !coverImageFile) return APIResponse(false, 'Field coverImage is required', null, 400);

    if(!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) return APIResponse(false, 'Field status is invalid', null, 400);
    if(!['es', 'en'].includes(language)) return APIResponse(false, 'Field language is invalid', null, 400);

    if((language === 'en' && !titleEn) || (postId && !titleEn)) return APIResponse(false, 'Field titleEn is required', null, 400);
    if((language === 'en' && !contentEn) || (postId && !contentEn)) return APIResponse(false, 'Field contentEn is required', null, 400);
    if((language === 'en' && !descriptionEn) || (postId && !descriptionEn)) return APIResponse(false, 'Field descriptionEn is required', null, 400);
    if((language === 'en' && !slugEn) || (postId && !slugEn)) return APIResponse(false, 'Field slugEn is required', null, 400);
    if((language === 'es' && !titleEs) || (postId && !titleEs)) return APIResponse(false, 'Field titleEs is required', null, 400);
    if((language === 'es' && !contentEs) || (postId && !contentEs)) return APIResponse(false, 'Field contentEs is required', null, 400);
    if((language === 'es' && !slugEs) || (postId && !slugEs)) return APIResponse(false, 'Field slugEs is required', null, 400);
    if((language === 'es' && !descriptionEs) || (postId && !descriptionEs)) return APIResponse(false, 'Field descriptionEs is required', null, 400);


    //Validar si es edicion o creacion 
    if(postId) {
        existingPost = await prisma.post.findFirst({ where: { id: postId}});
        if(!existingPost) return APIResponse(false, 'Post not found', null, 404);
        if(existingPost.creatorId !== user.id) return APIResponse(false, 'Unauthorized to edit this post', null, 401);
        uuid = existingPost.id;
        
        // Si es edición, NO permitir cambiar slugs ni títulos
        // Usar los valores existentes del post
        payload["titleEn"] = existingPost.titleEn;
        payload["titleEs"] = existingPost.titleEs;
        payload["slugEn"] = existingPost.slugEn;
        payload["slugEs"] = existingPost.slugEs;
    } else {
        // Si es creación, usar los valores del formulario
        payload["titleEn"] = titleEn;
        payload["titleEs"] = titleEs;
        payload["slugEn"] = slugEn;
        payload["slugEs"] = slugEs;

    // Verificar que los slugs no existan en otro post
    const slugConflictWhere: any = {
      OR: [
        { slugEn: slugEn || undefined },
        { slugEs: slugEs || undefined }
      ]
    };
    const slugConflict = await prisma.post.findFirst({ where: slugConflictWhere });
    if(slugConflict) return APIResponse(false, 'Post with this slug already exists', null, 400);
    }
    payload["contentEn"] = contentEn;
    payload["contentEs"] = contentEs;
    payload["descriptionEn"] = descriptionEn || null;
    payload["descriptionEs"] = descriptionEs || null;
    payload["readingTime"] = readingTime || 0;
    payload["status"] = status;
    payload["language"] = language; 
    payload["hashtags"] = hashtags;
    
    if (!postId) {
      payload["creatorId"] = user.id;
    }

    if (status === 'PUBLISHED' && (!existingPost || !existingPost.publishedAt)) {
        payload["publishedAt"] = new Date();
    }

    try{
        if(shouldTranslate){
            const suffixTarget = language === 'en' ? 'Es' : 'En';
            const targetLanguage = language === 'en' ? 'es' : 'en';
            const sourceTitle = language === 'en' ? titleEn : titleEs;
            const sourceDescription = language === 'en' ? descriptionEn : descriptionEs;
            const sourceContent = language === 'en' ? contentEn : contentEs;
            const sourceSlug = language === 'en' ? slugEn : slugEs;
            
            if(sourceTitle && sourceContent && sourceSlug) {
                const translation = await translatePost(
                    sourceTitle,
                    sourceDescription || null,
                    sourceContent,
                    sourceSlug,
                    language as 'en' | 'es',
                    targetLanguage as 'en' | 'es'
                );
                
                // Si es edición, NO actualizar título ni slug traducido
                if (!postId) {
                payload[`title${suffixTarget}`] = translation.title;
                    payload[`slug${suffixTarget}`] = translation.slug;
                }
                payload[`content${suffixTarget}`] = translation.content;
                payload[`description${suffixTarget}`] = translation.description;
            }
        }
    }catch(error){
        return APIResponse(false, 'Error processing translation post:', null, 500);
    }

    // Validate cover Image
    if (coverImageFile) {
      if (!coverImageFile.type || !coverImageFile.type.startsWith('image/')) return APIResponse(false, 'File must be an image (image/*)', null, 400);
      if (coverImageFile.size > 10 * 1024 * 1024) return APIResponse(false, 'Image is too large. Maximum 10MB', null, 400);

      try {
        const extension = coverImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Subir imagen original a Supabase Storage
        payload["coverImage"] = await uploadBufferToStorage( buffer, `covers/${uuid}.${extension}`, coverImageFile.type);

        // Upload thumbnail 400x300
        const thumbnailBuffer = await sharp(buffer)
          .resize(500, 300, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        payload["coverImageThumbnail"] = await uploadBufferToStorage( thumbnailBuffer, `covers/${uuid}_thumbnail.${extension}`, 'image/jpeg');
      } catch (error) {
        return APIResponse(false, 'Error processing cover image', null, 500);
      }
    }

    const post = existingPost ? await prisma.post.update({where: { id: postId! }, data: payload }) : await prisma.post.create({data: payload});

    return APIResponse(true, 'Post created successfully', {
        id: post.id,
        slugEn: slugEn,
        slugEs: slugEs,
     });
  } catch (error: any) {
    console.error('Error creating/updating post:', error);
    // No revelar detalles técnicos del error al cliente
    return APIResponse(false, 'Error al crear o actualizar el post. Por favor, intenta de nuevo.', null, 500);
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if(!user) return APIResponse(false, 'No autorizado', null, 401);
  
  return Response.json({ deleted: true });
}
