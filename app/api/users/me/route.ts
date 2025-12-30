import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadBufferToStorage, APIResponse } from "@/lib/api-helper";
import sharp from 'sharp';

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return APIResponse(false, 'No autorizado', null, 401);

    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';

    // 1. Buscar por clerkUserId
    let user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    // 2. Si no encuentra, buscar por email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // Si encuentra por email pero con diferente clerkUserId, actualizar
      if (user && user.clerkUserId !== clerkUser.id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkUserId: clerkUser.id,
            lastSignInAt: new Date(),
          },
        });
      }
    }

    // 3. Si aún no existe, crear
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
          role: 'USER',
          lastSignInAt: new Date(),
        },
      });
    } else if (user.clerkUserId === clerkUser.id) {
      // 4. Si existe con el clerkUserId correcto, actualizar lastSignInAt
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSignInAt: new Date(),
        },
      });
    }

    // Retornar usuario
    return APIResponse(true, 'Usuario obtenido correctamente', {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastSignInAt: user.lastSignInAt?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/users/me:', error);
    // No revelar detalles técnicos del error al cliente
    return APIResponse(false, 'Error al obtener usuario. Por favor, intenta de nuevo.', null, 500);
  }
}

export async function PUT(req: Request) {
  try {
    // Obtener usuario de Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return APIResponse(false, 'No autorizado', null, 401);
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!user) {
      return APIResponse(false, 'Usuario no encontrado', null, 404);
    }

    // Obtener datos del formulario
    const formData = await req.formData();
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const bio = formData.get('bio');
    const avatarFile = formData.get('avatar') as File | null;

    // Preparar datos para actualizar
    const updateData: any = {};

    if (firstName !== null && firstName !== undefined) {
      updateData.firstName = (firstName as string).trim() || null;
    }
    if (lastName !== null && lastName !== undefined) {
      updateData.lastName = (lastName as string).trim() || null;
    }
    if (bio !== null && bio !== undefined) {
      updateData.bio = (bio as string).trim() || null;
    }

    // Procesar imagen de avatar si existe
    if (avatarFile && avatarFile.size > 0) {
      try {
        // Validar que sea una imagen
        if (!avatarFile.type || !avatarFile.type.startsWith('image/')) {
          return APIResponse(false, 'El archivo debe ser una imagen', null, 400);
        }

        // Validar tamaño (máximo 5MB)
        if (avatarFile.size > 5 * 1024 * 1024) {
          return APIResponse(false, 'La imagen es demasiado grande. Máximo 5MB', null, 400);
        }

        const arrayBuffer = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Crear thumbnail (150x150) - siempre como JPEG
        const thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        const thumbnailFileName = `profiles/${user.id}.jpg`;
        const thumbnailUrl = await uploadBufferToStorage( thumbnailBuffer, thumbnailFileName, 'image/jpeg');

        if (!thumbnailUrl) {
          console.error('Failed to upload thumbnail to storage');
          return APIResponse(false, 'Error al subir la imagen de perfil. Por favor, intenta de nuevo.', null, 500);
        }

        // Guardar la URL del thumbnail en imageUrl
        updateData.imageUrl = thumbnailUrl;
        console.log('Profile thumbnail uploaded successfully:', thumbnailUrl);
        console.log('updateData before update:', updateData);
      } catch (error) {
        console.error('Error processing avatar:', error);
        // No revelar detalles técnicos del error al cliente
        return APIResponse(false, 'Error al procesar la imagen de perfil. Por favor, intenta con otra imagen.', null, 500);
      }
    }

    // Verificar que hay datos para actualizar
    if (Object.keys(updateData).length === 0) {
      return APIResponse(false, 'No hay cambios para actualizar', null, 400);
    }

    console.log('Updating user with data:', updateData);
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    console.log('User updated successfully. New imageUrl:', updatedUser.imageUrl);

    // Retornar usuario actualizado
    return APIResponse(true, 'Usuario actualizado correctamente', {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        imageUrl: updatedUser.imageUrl,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
        lastSignInAt: updatedUser.lastSignInAt?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error('Error in PUT /api/users/me:', error);
    // No revelar detalles técnicos del error al cliente
    return APIResponse(false, 'Error al actualizar usuario. Por favor, intenta de nuevo.', null, 500);
  }
}

