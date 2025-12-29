import { type NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
const loginPage = "/login";
// Routes that don't require authentication
const publicRoutes = [
  "/", // Public download/landing page
  loginPage,
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/unauthorized",
  "/api/auth",
  "/api/health",
  "/api/info",
  "/api/trpc",
  "/api/lambda", // tRPC endpoint for mobile apps (public procedures handled by tRPC)
  "/api/webhooks", // External webhook handlers (RevenueCat, etc.)
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/.well-known", // Android assetlinks.json and iOS apple-app-site-association
];

// Routes that require admin access (entire admin dashboard)
const adminRoutes = ["/admin"];

function isPublicRoute(pathname: string): boolean {
  // Allow exact matches and sub-paths
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function requiresAdminAccess(pathname: string): boolean {
  return adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, check authentication
  try {
    // In embedded mode, auth endpoints are served from dashboard at /api/auth/*
    // In non-embedded mode, auth endpoints return 404, so we need external URL
    const baseURL = new URL(request.url).origin;

    if (!baseURL) {
      console.warn("No base URL configured for middleware auth check");
      return NextResponse.redirect(new URL(loginPage, request.url));
    }

    const { data: session } = (await betterFetch("/api/auth/get-session", {
      baseURL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })) as { data: { user: { role?: string | null } } | null };

    // No session - redirect to login
    if (!session) {
      return NextResponse.redirect(new URL(loginPage, request.url));
    }

    // Check admin access for admin routes
    if (requiresAdminAccess(pathname)) {
      if (!session?.user?.role || session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.warn("Middleware auth check failed:", error);
    return NextResponse.redirect(new URL(loginPage, request.url));
  }
}

export const config = {
  // Match all routes except static files and API routes handled by Next.js
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
