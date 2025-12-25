"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user: clerkUser,
  };
}
