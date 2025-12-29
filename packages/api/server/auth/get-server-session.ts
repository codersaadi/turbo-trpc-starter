"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, type Session } from "./auth.config";

/**
 * Get the current server session. Returns a properly typed Session or null.
 * Casts the BetterAuth session to our extended Session type.
 */
export async function getServerSession(): Promise<Session | null> {
  const rawSession = await authConfig.api.getSession({
    headers: await headers(),
  });
  
  if (!rawSession) {
    return null;
  }
  
  // Cast to our Session type - the role from DB is stored as string but we know 
  // it's one of our valid role types based on our schema constraints
  return rawSession as unknown as Session;
}

/**
 * Get the current server session or redirect to login if not authenticated.
 * Useful for protected pages that require authentication.
 */
export async function requireSession(): Promise<Session> {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Get the current server session and require admin role.
 * Redirects to login if not authenticated, or to dashboard if not admin.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await requireSession();
  
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  
  return session;
}
