/**
 * API Client - Simple y predecible
 * 
 * Su único trabajo:
 * - Mandar el token si existe
 * - Hacer fetch
 * - Devolver data o error
 * Nada más.
 */

export async function api(
  path: string,
  options: RequestInit = {}
) {
  let token: string | null = null;
  
  // Obtener token de Clerk
  // En server-side
  if (typeof window === 'undefined') {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      token = await session.getToken();
    } catch {
      token = null;
    }
  }
  // En client-side, el token se debe pasar manualmente o usar fetch directamente
  // No se puede usar useAuth() aquí porque no estamos en un componente React

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}
