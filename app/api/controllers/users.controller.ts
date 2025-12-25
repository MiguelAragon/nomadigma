/**
 * Users Controller
 */

import { ApiRequest } from "@/lib/api-middleware";

export async function getCurrentUser(req: ApiRequest) {
  if (!req.user) {
    return req.response(false, 'No autorizado', undefined, 401);
  }

  try {
    return req.response(true, 'Usuario obtenido correctamente', { user: req.user });
  } catch (error: any) {
    console.error('Error in /api/users/me:', error);
    return req.response(false, 'Error al obtener usuario', undefined, 500);
  }
}

