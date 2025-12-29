import { type NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { LANGUAGES, ORG_LOCALE_HEADER } from "@repo/i18n/config/client";
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

  // Check if pathname starts with a locale
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";

  // Check if the first segment is a locale code (e.g., 'en-US', 'ar')
  const isLocaleInPath = LANGUAGES.some((lang) => firstSegment === lang);

  // Determine the actual path (without locale prefix)
  let actualPath: string;
  let localePrefix: string | null = null;

  if (isLocaleInPath) {
    localePrefix = firstSegment;
    actualPath =
      pathSegments.length > 1 ? `/${pathSegments.slice(1).join("/")}` : "/";
  } else {
    actualPath = pathname;
  }

  // If the URL contains a locale, redirect to remove it and set the cookie
  if (isLocaleInPath) {
    const redirectUrl = new URL(actualPath, request.url);
    redirectUrl.search = request.nextUrl.search;

    const response = NextResponse.redirect(redirectUrl);

    // Set the locale cookie so the client knows which language to use
    // We need to import ORG_LOCALE_HEADER if it's not available,
    // but looking at imports it seems we need to add it or use the string literal if imports are tricky to change here.
    // The file already imports FALLBACK_LNG, LANGUAGES from @repo/i18n/config/client
    // Let's check imports first. ORG_LOCALE_HEADER is not imported.
    // I will use the string "x-org-locale" or try to add the import in a separate step if needed.
    // Wait, I can see the imports in the file view.
    // It imports { FALLBACK_LNG, LANGUAGES } from "@repo/i18n/config/client";
    // I should probably add ORG_LOCALE_HEADER to the import list first or just use the string if I want to be safe in one go.
    // However, to be clean, I should probably update the imports first or just use the string "x-org-locale" which is likely the value.
    // Actually, looking at other files, it seems ORG_LOCALE_HEADER is standard.
    // Let's assume I can't easily change imports in this block.
    // I'll use a hardcoded string "x-org-locale" for now to be safe, or better, I will check the imports again.
    // The imports are at the top. I can't change them with this tool call easily if I'm targeting the middle.
    // I'll use "x-org-locale" and add a TODO or just use it.
    // Actually, I'll just use the string literal "x-org-locale" as it is defined in the config.

    response.cookies.set(ORG_LOCALE_HEADER, firstSegment);
    return response;
  }

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
