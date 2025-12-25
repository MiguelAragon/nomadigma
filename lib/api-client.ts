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
  } else {
    // En client-side
    try {
      const { useAuth } = await import("@clerk/nextjs");
      // Nota: En client-side, mejor usar getToken directamente
      const { getToken } = await import("@clerk/nextjs");
      token = await getToken();
    } catch {
      token = null;
    }
  }

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
