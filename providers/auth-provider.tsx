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
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

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
  return (
    <ClerkProvider>
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
