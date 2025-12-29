"use client";

import { useUserContext } from "@/providers/auth-provider";

export function useAuth() {
  return useUserContext();
}
