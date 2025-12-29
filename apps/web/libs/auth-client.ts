"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for client-side authentication.
 * Provides methods for signIn, signOut, and session management.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  //   plugins: []
});

// Export individual methods for convenience
export const { signIn, signOut, signUp, useSession } = authClient;
