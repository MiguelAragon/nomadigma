"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export function useApiClient() {
  const router = useRouter();
  const { refetch } = useAuth();

  const apiCall = async (path: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      // Manejar errores de autenticación
      if (response.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        router.push('/login');
        return { success: false, data: null };
      }

      // Manejar errores de permisos
      if (response.status === 403) {
        toast.error('No tienes permisos para realizar esta acción');
        router.push('/');
        return { success: false, data: null };
      }

      // Si no fue exitoso, mostrar error
      if (!response.ok || !data.success) {
        toast.error(data.message || 'Error al procesar la solicitud');
        return { success: false, data: null };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Error de conexión. Por favor, intenta de nuevo.');
      return { success: false, data: null };
    }
  };

  return { apiCall };
}

