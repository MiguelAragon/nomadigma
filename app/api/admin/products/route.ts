import { prisma } from "@/lib/prisma";
import { APIResponse, getUser, uploadBufferToStorage, validateImageFile, getFormValue, generateSlug, translatePost } from "@/lib/api-helper";
import { randomUUID } from 'crypto';

// GET - Listar productos con paginación o obtener uno por ID
export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    // Si hay ID, devolver un solo producto
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!product) {
        return APIResponse(false, 'Producto no encontrado', null, 404);
      }

      return APIResponse(true, 'Producto obtenido correctamente', product);
    }

    // Listar productos con paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.product.count(),
    ]);

    return APIResponse(true, 'Productos obtenidos correctamente', {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/products:', error);
    console.error('Error details:', error.message, error.stack);
    return APIResponse(false, 'Error al obtener productos. Por favor, intenta de nuevo.', null, 500);
  }
}

// POST - Crear nuevo producto
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const formData = await req.formData();
    const uuid = randomUUID();

    // Campos en inglés
    const titleEn = getFormValue<string>(formData, 'titleEn');
    const descriptionEn = getFormValue<string>(formData, 'descriptionEn');
    let slugEn = getFormValue<string>(formData, 'slugEn');

    // Campos en español
    const titleEs = getFormValue<string>(formData, 'titleEs');
    const descriptionEs = getFormValue<string>(formData, 'descriptionEs');
    let slugEs = getFormValue<string>(formData, 'slugEs');

    // Campos generales
    const language = getFormValue<string>(formData, 'language');
    const category = getFormValue<string>(formData, 'category');
    const price = getFormValue<number>(formData, 'price', { parse: v => parseFloat(v) });
    const finalPrice = getFormValue<number>(formData, 'finalPrice', { parse: v => parseFloat(v) });
    const isOnSale = getFormValue<string>(formData, 'isOnSale') === 'true' || getFormValue<string>(formData, 'isOnSale') === 'on';
    const discountPercentage = getFormValue<number>(formData, 'discountPercentage', { parse: v => parseFloat(v) });
    const productType = getFormValue<string>(formData, 'productType') || 'PHYSICAL';
    const hasShippingCost = getFormValue<string>(formData, 'hasShippingCost') === 'true' || getFormValue<string>(formData, 'hasShippingCost') === 'on';
    const shippingCost = getFormValue<number>(formData, 'shippingCost', { parse: v => parseFloat(v) });
    const active = getFormValue<string>(formData, 'active') === 'true' || getFormValue<string>(formData, 'active') === 'on';
    const imageFiles = formData.getAll('images') as File[];
    const variantsJson = getFormValue<string>(formData, 'variants');

    // Validar campos requeridos
    if (!language) return APIResponse(false, 'El campo language es requerido', null, 400);
    if (!['es', 'en'].includes(language)) return APIResponse(false, 'El campo language es inválido', null, 400);
    // Permitir precio = 0 para productos gratis
    if (!category || price === null || price === undefined || isNaN(price) || price < 0) {
      return APIResponse(false, 'Categoría y precio son requeridos. El precio debe ser mayor o igual a 0', null, 400);
    }

    // Validar campos según el idioma seleccionado
    if (language === 'en') {
      if (!titleEn || titleEn.trim() === '') return APIResponse(false, 'El campo titleEn es requerido cuando el idioma es inglés', null, 400);
      if (!descriptionEn || descriptionEn.trim() === '' || descriptionEn.replace(/<[^>]*>/g, '').trim() === '') {
        return APIResponse(false, 'El campo descriptionEn es requerido y debe tener contenido cuando el idioma es inglés', null, 400);
      }
      if (!slugEn || slugEn.trim() === '') return APIResponse(false, 'El campo slugEn es requerido cuando el idioma es inglés', null, 400);
    } else {
      if (!titleEs || titleEs.trim() === '') return APIResponse(false, 'El campo titleEs es requerido cuando el idioma es español', null, 400);
      if (!descriptionEs || descriptionEs.trim() === '' || descriptionEs.replace(/<[^>]*>/g, '').trim() === '') {
        return APIResponse(false, 'El campo descriptionEs es requerido y debe tener contenido cuando el idioma es español', null, 400);
      }
      if (!slugEs || slugEs.trim() === '') return APIResponse(false, 'El campo slugEs es requerido cuando el idioma es español', null, 400);
    }

    // Validar categoría
    // Validar categorías usando los keys de CATEGORY_SHOP
    const validCategories = ['guides', 'services', 'essentials', 'others'];
    // También aceptar valores antiguos para compatibilidad
    const legacyCategories = ['Guías', 'Herramientas', 'Servicios', 'Merch', 'Recursos', 'Guides', 'Services', 'Essentials', 'Others'];
    if (!validCategories.includes(category) && !legacyCategories.includes(category)) {
      return APIResponse(false, 'Categoría inválida', null, 400);
    }
    
    // Convertir categorías legacy a los nuevos keys
    const categoryMap: Record<string, string> = {
      'Guías': 'guides',
      'Guides': 'guides',
      'Herramientas': 'guides',
      'Servicios': 'services',
      'Services': 'services',
      'Merch': 'essentials',
      'Essentials': 'essentials',
      'Recursos': 'others',
      'Others': 'others',
    };
    
    const normalizedCategory = categoryMap[category] || category;

    // Generar slugs si no se proporcionaron
    const sourceSlug = language === 'en' ? slugEn : slugEs;
    if (!sourceSlug) {
      const sourceTitle = language === 'en' ? titleEn : titleEs;
      const generatedSlug = generateSlug(sourceTitle || '');
      if (language === 'en') {
        slugEn = generatedSlug;
      } else {
        slugEs = generatedSlug;
      }
    }

    // Verificar que los slugs no existan
    if (slugEn) {
      const slugExists = await prisma.product.findFirst({
        where: {
          OR: [
            { slugEn: slugEn },
            { slugEs: slugEn }
          ]
        }
      });
      if (slugExists) {
        return APIResponse(false, 'Ya existe un producto con este slug en inglés', null, 400);
      }
    }

    if (slugEs) {
      const slugExists = await prisma.product.findFirst({
        where: {
          OR: [
            { slugEn: slugEs },
            { slugEs: slugEs }
          ]
        }
      });
      if (slugExists) {
        return APIResponse(false, 'Ya existe un producto con este slug en español', null, 400);
      }
    }

    // Procesar imágenes
    const imageUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      if (!imageFile || imageFile.size === 0) continue;

      const validation = validateImageFile(imageFile);
      if (!validation.isValid) {
        return APIResponse(false, validation.error!, null, 400);
      }

      try {
        const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Subir imagen original
        const imageUrl = await uploadBufferToStorage(
          buffer,
          `products/${uuid}_${i}.${extension}`,
          imageFile.type
        );

        imageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        return APIResponse(false, 'Error al procesar las imágenes. Por favor, intenta de nuevo.', null, 500);
      }
    }

    // Parsear variantes si existen
    let variants = null;
    if (variantsJson) {
      try {
        const parsedVariants = JSON.parse(variantsJson);
        // Validar que sea un array y que cada variante tenga language, label y values
        if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
          const validVariants = parsedVariants.filter((v: any) => 
            v && 
            typeof v.language === 'string' && 
            typeof v.label === 'string' && 
            Array.isArray(v.values) && 
            v.values.length > 0
          );
          if (validVariants.length > 0) {
            variants = validVariants;
          }
        }
      } catch (error) {
        console.error('Error parsing variants:', error);
      }
    }

    // Procesar archivos de variantes (solo para productos digitales)
    let variantFiles: any[] = [];
    if (productType === 'DIGITAL') {
      // Obtener el JSON de variables del formData
      const variantFilesJson = getFormValue<string>(formData, 'variantFiles');
      if (variantFilesJson) {
        try {
          const parsedVariantFiles = JSON.parse(variantFilesJson);
          if (Array.isArray(parsedVariantFiles)) {
            // Procesar cada variable
            for (let i = 0; i < parsedVariantFiles.length; i++) {
              const vf = parsedVariantFiles[i];
              
              if (vf.type === 'file') {
                // Buscar el archivo subido
                const fileKey = `variantFile_${i}`;
                const file = formData.get(fileKey) as File | null;
                
                if (file && file.size > 0) {
                  try {
                    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Subir archivo
                    const fileUrl = await uploadBufferToStorage(
                      buffer,
                      `products/variants/${uuid}_${i}_${Date.now()}.${extension}`,
                      file.type || 'application/octet-stream'
                    );

                    variantFiles.push({
                      values: vf.values || [],
                      type: 'file',
                      url: fileUrl,
                    });
                  } catch (error) {
                    console.error(`Error processing variant file ${i}:`, error);
                    return APIResponse(false, `Error al procesar el archivo para la variable ${i + 1}. Por favor, intenta de nuevo.`, null, 500);
                  }
                } else {
                  return APIResponse(false, `La variable ${i + 1} de tipo archivo no tiene un archivo seleccionado. Por favor, intenta de nuevo.`, null, 400);
                }
              } else if (vf.type === 'url' && vf.url) {
                variantFiles.push({
                  values: vf.values || [],
                  type: 'url',
                  url: vf.url,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing variant files:', error);
          return APIResponse(false, 'Error al procesar las variables. Por favor, intenta de nuevo.', null, 400);
        }
      }
    }

    // Validar productType
    if (!['PHYSICAL', 'DIGITAL'].includes(productType)) {
      return APIResponse(false, 'Tipo de producto inválido', null, 400);
    }

    // Validar shippingCost solo si es producto físico y tiene costo de envío
    if (productType === 'PHYSICAL' && hasShippingCost && (shippingCost === null || shippingCost < 0)) {
      return APIResponse(false, 'El costo de envío debe ser un número positivo para productos físicos con envío', null, 400);
    }

    // Preparar payload inicial con los campos del idioma fuente
    const payload: any = {
      category: normalizedCategory,
      price, // Precio original (siempre)
      finalPrice: finalPrice !== null ? finalPrice : null, // Precio final (null si no hay descuento)
      isOnSale,
      discountPercentage: isOnSale && discountPercentage ? discountPercentage : null,
      productType: productType as 'PHYSICAL' | 'DIGITAL',
      hasShippingCost: productType === 'PHYSICAL' ? hasShippingCost : false,
      shippingCost: (productType === 'PHYSICAL' && hasShippingCost) ? shippingCost : null,
      images: imageUrls,
      variants: variants ? variants : null,
      active,
      creatorId: user.id,
    };

    // Solo incluir variantFiles si es producto digital y tiene valores
    if (productType === 'DIGITAL' && variantFiles.length > 0) {
      payload.variantFiles = variantFiles;
    }

    // Establecer campos del idioma fuente
    if (language === 'en') {
      payload.titleEn = titleEn;
      payload.descriptionEn = descriptionEn;
      payload.slugEn = slugEn;
    } else {
      payload.titleEs = titleEs;
      payload.descriptionEs = descriptionEs;
      payload.slugEs = slugEs;
    }

    // Traducir al otro idioma automáticamente
    try {
      const suffixTarget = language === 'en' ? 'Es' : 'En';
      const targetLanguage = language === 'en' ? 'es' : 'en';
      const sourceTitle = language === 'en' ? titleEn : titleEs;
      const sourceDescription = language === 'en' ? descriptionEn : descriptionEs;
      const sourceSlug = language === 'en' ? slugEn : slugEs;
      
      if (sourceTitle && sourceDescription && sourceSlug) {
        const translation = await translatePost(
          sourceTitle,
          sourceDescription,
          sourceDescription, // Usar description como content para productos
          sourceSlug,
          language as 'en' | 'es',
          targetLanguage as 'en' | 'es'
        );
        
        payload[`title${suffixTarget}`] = translation.title;
        payload[`description${suffixTarget}`] = translation.description;
        payload[`slug${suffixTarget}`] = translation.slug;
      }
    } catch (error: any) {
      console.error('Error translating product:', error);
      const errorMessage = error?.message || 'Error desconocido al traducir';
      return APIResponse(false, `Error al traducir el producto: ${errorMessage}`, null, 500);
    }

    // Crear producto
    try {
      const product = await prisma.product.create({
        data: payload as any,
      });

      return APIResponse(true, 'Producto creado correctamente', product);
    } catch (error: any) {
      console.error('Error creating product in database:', error);
      const errorMessage = error?.message || 'Error desconocido al crear en la base de datos';
      return APIResponse(false, `Error al crear el producto: ${errorMessage}`, null, 500);
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error);
    const errorMessage = error?.message || 'Error desconocido';
    return APIResponse(false, `Error al crear el producto: ${errorMessage}`, null, 500);
  }
}

// PATCH - Actualizar producto
export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return APIResponse(false, 'No autorizado', null, 401);
    if (user.role !== 'ADMIN') return APIResponse(false, 'No tienes permisos para acceder a este recurso', null, 403);

    const formData = await req.formData();
    const productId = getFormValue<string>(formData, 'productId');

    if (!productId) {
      return APIResponse(false, 'ID del producto es requerido', null, 400);
    }

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return APIResponse(false, 'Producto no encontrado', null, 404);
    }

    const payload: any = {};
    const uuid = randomUUID();

    // Campos opcionales - solo actualizar si se proporcionan
    const titleEn = getFormValue<string>(formData, 'titleEn');
    const titleEs = getFormValue<string>(formData, 'titleEs');
    const descriptionEn = getFormValue<string>(formData, 'descriptionEn');
    const descriptionEs = getFormValue<string>(formData, 'descriptionEs');
    const slugEn = getFormValue<string>(formData, 'slugEn');
    const slugEs = getFormValue<string>(formData, 'slugEs');
    const category = getFormValue<string>(formData, 'category');
    const price = getFormValue<number>(formData, 'price', { parse: v => parseFloat(v) });
    const finalPrice = getFormValue<number>(formData, 'finalPrice', { parse: v => parseFloat(v) });
    const isOnSale = getFormValue<string>(formData, 'isOnSale') === 'true' || getFormValue<string>(formData, 'isOnSale') === 'on';
    const discountPercentage = getFormValue<number>(formData, 'discountPercentage', { parse: v => parseFloat(v) });
    const productType = getFormValue<string>(formData, 'productType');
    const hasShippingCost = getFormValue<string>(formData, 'hasShippingCost') === 'true' || getFormValue<string>(formData, 'hasShippingCost') === 'on';
    const shippingCost = getFormValue<number>(formData, 'shippingCost', { parse: v => parseFloat(v) });
    const activeValue = getFormValue<string>(formData, 'active');
    const variantsJson = getFormValue<string>(formData, 'variants');
    const translate = getFormValue<string>(formData, 'translate');
    const translateFrom = getFormValue<string>(formData, 'translateFrom'); // Idioma desde el cual traducir

    if (titleEn) payload.titleEn = titleEn;
    if (titleEs) payload.titleEs = titleEs;
    if (descriptionEn) payload.descriptionEn = descriptionEn;
    if (descriptionEs) payload.descriptionEs = descriptionEs;
    if (slugEn) {
      // Verificar que el nuevo slug no exista en otro producto
      const slugExists = await prisma.product.findFirst({ 
        where: { 
          OR: [
            { slugEn: slugEn },
            { slugEs: slugEn }
          ],
          id: { not: productId } 
        } 
      });
      if (!slugExists) {
        payload.slugEn = slugEn;
      } else {
        return APIResponse(false, 'Ya existe un producto con este slug en inglés', null, 400);
      }
    }
    
    if (slugEs) {
      // Verificar que el nuevo slug no exista en otro producto
      const slugExists = await prisma.product.findFirst({ 
        where: { 
          OR: [
            { slugEn: slugEs },
            { slugEs: slugEs }
          ],
          id: { not: productId } 
        } 
      });
      if (!slugExists) {
        payload.slugEs = slugEs;
      } else {
        return APIResponse(false, 'Ya existe un producto con este slug en español', null, 400);
      }
    }
    if (category) {
      // Validar categorías usando los keys de CATEGORY_SHOP
      const validCategories = ['guides', 'services', 'essentials', 'others'];
      // También aceptar valores antiguos para compatibilidad
      const legacyCategories = ['Guías', 'Herramientas', 'Servicios', 'Merch', 'Recursos', 'Guides', 'Services', 'Essentials', 'Others'];
      if (!validCategories.includes(category) && !legacyCategories.includes(category)) {
        return APIResponse(false, 'Categoría inválida', null, 400);
      }
      
      // Convertir categorías legacy a los nuevos keys
      const categoryMap: Record<string, string> = {
        'Guías': 'guides',
        'Guides': 'guides',
        'Herramientas': 'guides',
        'Servicios': 'services',
        'Services': 'services',
        'Merch': 'essentials',
        'Essentials': 'essentials',
        'Recursos': 'others',
        'Others': 'others',
      };
      
      payload.category = categoryMap[category] || category;
    }
    // Permitir precio = 0 para productos gratis
    if (price !== null && price !== undefined && !isNaN(price) && price >= 0) {
      payload.price = price; // Precio original (siempre)
    }
    // Manejar finalPrice: puede ser null (sin descuento), 0 (gratis), o un número positivo
    const finalPriceValue = formData.get('finalPrice');
    if (finalPriceValue !== null) {
      // El campo fue enviado
      if (finalPriceValue === 'null' || finalPriceValue === '') {
        // Se envió explícitamente como null (sin descuento)
        payload.finalPrice = null;
      } else if (finalPrice !== null && finalPrice !== undefined && !isNaN(finalPrice)) {
        // Es un número válido (puede ser 0 para productos gratis)
        payload.finalPrice = finalPrice;
      } else {
        // Si no se puede parsear, establecer como null
        payload.finalPrice = null;
      }
    }
    // Si no se envió el campo finalPrice, no actualizarlo (mantener el valor existente)
    if (activeValue !== null) {
      payload.active = activeValue === 'true' || activeValue === 'on';
    }
    payload.isOnSale = isOnSale;
    payload.discountPercentage = isOnSale && discountPercentage ? discountPercentage : null;
    
    // Procesar tipo de producto y costo de envío
    // Si no se proporciona productType, usar el valor existente o 'PHYSICAL' por defecto
    const finalProductType = productType || (existingProduct as any).productType || 'PHYSICAL';
    
    if (!['PHYSICAL', 'DIGITAL'].includes(finalProductType)) {
      return APIResponse(false, 'Tipo de producto inválido', null, 400);
    }
    
    payload.productType = finalProductType as 'PHYSICAL' | 'DIGITAL';
    
    // Si es digital, forzar hasShippingCost a false y shippingCost a null
    if (finalProductType === 'DIGITAL') {
      payload.hasShippingCost = false;
      payload.shippingCost = null;
    } else {
      // Si es físico, procesar costo de envío
      // Si no se proporciona hasShippingCost, usar el valor existente o false por defecto
      const finalHasShippingCost = productType !== null && productType !== undefined 
        ? hasShippingCost 
        : ((existingProduct as any).hasShippingCost || false);
      
      payload.hasShippingCost = finalHasShippingCost;
      
      if (finalHasShippingCost) {
        // Si tiene costo de envío, usar el valor proporcionado o el existente
        const finalShippingCost = shippingCost !== null && shippingCost !== undefined 
          ? shippingCost 
          : ((existingProduct as any).shippingCost || 0);
        payload.shippingCost = finalShippingCost >= 0 ? finalShippingCost : 0;
      } else {
        payload.shippingCost = null;
      }
    }
    
    // Procesar variantes
    let finalVariants = null;
    if (variantsJson !== null && variantsJson !== undefined) {
      try {
        const parsedVariants = JSON.parse(variantsJson);
        // Si es un array vacío, establecer como null
        if (Array.isArray(parsedVariants) && parsedVariants.length === 0) {
          finalVariants = null;
        } else if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
          // Validar que cada variante tenga language, label y values
          const validVariants = parsedVariants.filter((v: any) => 
            v && 
            typeof v.language === 'string' && 
            typeof v.label === 'string' && 
            Array.isArray(v.values) && 
            v.values.length > 0
          );
          if (validVariants.length > 0) {
            finalVariants = validVariants;
          } else {
            finalVariants = null;
          }
        } else {
          finalVariants = null;
        }
        payload.variants = finalVariants;
      } catch (error) {
        console.error('Error parsing variants:', error);
        // Si hay error, no actualizar variants (mantener las existentes)
      }
    }

    // Procesar archivos de variantes (solo para productos digitales)
    if (finalProductType === 'DIGITAL') {
      // Obtener el JSON de variables del formData
      const variantFilesJson = getFormValue<string>(formData, 'variantFiles');
      if (variantFilesJson) {
        try {
          const parsedVariantFiles = JSON.parse(variantFilesJson);
          if (Array.isArray(parsedVariantFiles)) {
            const variantFiles: any[] = [];
            
            // Procesar cada variable
            let fileIndex = 0;
            for (let i = 0; i < parsedVariantFiles.length; i++) {
              const vf = parsedVariantFiles[i];
              
              if (vf.type === 'file') {
                // Buscar el archivo subido (solo si es un archivo nuevo)
                const fileKey = `variantFile_${fileIndex}`;
                const file = formData.get(fileKey) as File | null;
                
                if (file && file.size > 0) {
                  // Archivo nuevo: subirlo
                  try {
                    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Subir archivo
                    const fileUrl = await uploadBufferToStorage(
                      buffer,
                      `products/variants/${productId}_${fileIndex}_${Date.now()}.${extension}`,
                      file.type || 'application/octet-stream'
                    );

                    variantFiles.push({
                      values: vf.values || [],
                      type: 'file',
                      url: fileUrl,
                    });
                    fileIndex++;
                  } catch (error) {
                    console.error(`Error processing variant file ${i}:`, error);
                    return APIResponse(false, `Error al procesar el archivo para la variable ${i + 1}. Por favor, intenta de nuevo.`, null, 500);
                  }
                } else if (vf.url) {
                  // Archivo existente: mantener la URL
                  variantFiles.push({
                    values: vf.values || [],
                    type: 'file',
                    url: vf.url,
                  });
                } else {
                  return APIResponse(false, `La variable ${i + 1} de tipo archivo no tiene un archivo seleccionado ni una URL existente. Por favor, intenta de nuevo.`, null, 400);
                }
              } else if (vf.type === 'url' && vf.url) {
                variantFiles.push({
                  values: vf.values || [],
                  type: 'url',
                  url: vf.url,
                });
              }
            }
            
            payload.variantFiles = variantFiles.length > 0 ? variantFiles : null;
          }
        } catch (error) {
          console.error('Error parsing variant files:', error);
          return APIResponse(false, 'Error al procesar las variables. Por favor, intenta de nuevo.', null, 400);
        }
      } else {
        // Si no se envía variantFiles, mantener los existentes o eliminar si cambió a físico
        const existingVariantFiles = (existingProduct as any).variantFiles;
        if (Array.isArray(existingVariantFiles)) {
          payload.variantFiles = existingVariantFiles;
        } else {
          payload.variantFiles = null;
        }
      }
    } else if (finalProductType === 'PHYSICAL') {
      // Si cambió a físico, eliminar archivos de variantes
      payload.variantFiles = null;
    }

    // Procesar nuevas imágenes
    const imageFiles = formData.getAll('images') as File[];
    const newImageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      if (!imageFile || imageFile.size === 0) continue;

      const validation = validateImageFile(imageFile);
      if (!validation.isValid) {
        return APIResponse(false, validation.error!, null, 400);
      }

      try {
        const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Subir imagen original
        const imageUrl = await uploadBufferToStorage(
          buffer,
          `products/${uuid}_${i}.${extension}`,
          imageFile.type
        );

        newImageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        return APIResponse(false, 'Error al procesar las imágenes. Por favor, intenta de nuevo.', null, 500);
      }
    }

    // Manejar imágenes existentes y nuevas
    const existingImagesJson = getFormValue<string>(formData, 'existingImages');
    let existingImages: string[] = [];
    
    if (existingImagesJson) {
      try {
        existingImages = JSON.parse(existingImagesJson);
      } catch (error) {
        console.error('Error parsing existingImages:', error);
      }
    } else {
      // Si no se especifican, mantener todas las existentes
      existingImages = existingProduct.images;
    }

    // Combinar imágenes existentes (que se mantienen) con las nuevas
    payload.images = [...existingImages, ...newImageUrls];

    // La traducción solo se hace al CREAR productos, NO al actualizar
    // Removido: traducción automática en PATCH

    // Debug: verificar que variants esté en el payload
    console.log('Payload antes de actualizar:', JSON.stringify(payload, null, 2));

    // Actualizar producto
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: payload,
      });

      return APIResponse(true, 'Producto actualizado correctamente', updatedProduct);
    } catch (dbError: any) {
      console.error('Database error updating product:', dbError);
      console.error('Error details:', {
        code: dbError.code,
        meta: dbError.meta,
        message: dbError.message,
        payload: Object.keys(payload),
      });
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/products:', error);
    console.error('Error stack:', error.stack);
    const errorMessage = error?.message || 'Error desconocido';
    return APIResponse(false, `Error al actualizar el producto: ${errorMessage}`, null, 500);
  }
}

