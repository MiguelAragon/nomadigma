/**
 * AuthProvider - Solo estado, no reglas
 * No permisos. No lógica rara. Solo estado.
 */

"use client";

import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface DbUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
}

interface UserContextType {
  user: DbUser | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProviderInner({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: clerkLoaded, signOut } = useClerkAuth();
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/users/me');
      const data = await response.json();
      
      if (response.ok && data.success && data.data?.user) {
        // Usuario validado correctamente en la DB
        setUser(data.data.user);
      } else {
        // ERROR: Usuario de Clerk no existe/no es válido en la DB
        // Desloguear de Clerk para que no se vea la sesión iniciada
        console.error('Usuario no validado en la base de datos. Cerrando sesión...');
        setUser(null);
        await signOut();
      }
    } catch (error) {
      // ERROR: Fallo al comunicarse con la API
      // Desloguear de Clerk para mantener consistencia
      console.error('Error fetching user:', error);
      setUser(null);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, signOut]);

  useEffect(() => {
    if (clerkLoaded) {
      fetchUser();
    }
  }, [clerkLoaded, fetchUser]);

  return (
    <UserContext.Provider value={{ user, isLoading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usar las URLs de las variables de entorno o las por defecto
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/login";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/signup";
  const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/";
  const afterSignUpUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/";

  return (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignInUrl={afterSignInUrl}
      afterSignUpUrl={afterSignUpUrl}
    >
      <UserProviderInner>
      {children}
      </UserProviderInner>
    </ClerkProvider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within AuthProvider');
  }
  return context;
}
