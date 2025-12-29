import { sendEmail } from "../../server/email/send";
import { betterAuth } from "better-auth";
import { authPlugins } from "./plugins";
import { isProviderEnabled } from "./providers";
import { forgotPasswordTemplate } from "../../server/email/templates/auth-email-templates";
import {
  users,
  sessions,
  accounts,
  verifications,
  jwks,
} from "../../server/db/schema/better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { google } from "./providers/google";
import { facebook } from "./providers/facebook";
import { getTrustedOriginsFromEnv } from "@repo/env";
import { serverDB } from "../db/server";
/**
 * Enhanced Better Auth configuration with comprehensive feature support
 * and environment-based conditional loading.
 */
export const authConfig = betterAuth({
  database: drizzleAdapter(serverDB, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      jwks: jwks,
    },
  }),

  // Define custom user fields for proper type inference
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },

  plugins: authPlugins,

  // Enhanced session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    freshAge: 60 * 15, // Consider session "fresh" for 15 minutes
  },

  // Email and password authentication (conditional)
  // Note: Email verification is handled by custom OTP workflow in auth router
  ...(true && {
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // Disable Better Auth signup - using custom signup with OTP
      autoSignIn: false, // Disabled - using custom session creation in verifyEmailWithOTP
      requireEmailVerification: true, // IMPORTANT: Block unverified users from signing in
      minPasswordLength: process.env.MIN_PASSWORD_LENGTH
        ? parseInt(process.env.MIN_PASSWORD_LENGTH, 10)
        : undefined,
      maxPasswordLength: process.env.MAX_PASSWORD_LENGTH
        ? parseInt(process.env.MAX_PASSWORD_LENGTH, 10)
        : undefined,
      async sendResetPassword(data, _request) {
        await sendEmail({
          to: data.user.email,
          subject: "Reset your password",
          react: forgotPasswordTemplate({
            type: "magic-link",
            link: data.url,
            username: data.user.name ?? data.user.email,
          }),
        });
      },
    },
  }),
  // Removed: emailVerification config - using custom OTP workflow instead
  // Custom signup and verification handled by:
  // - auth.signup endpoint (creates user + sends OTP)
  // - auth.verifyEmail endpoint (verifies OTP + creates session)
  // See: packages/api/routers/auth.ts
  // Social providers configuration
  socialProviders: {
    google: google,
    facebook: facebook,
  },

  // Advanced configuration
  advanced: {
    cookiePrefix: process.env.COOKIE_PREFIX,
    crossSubDomainCookies: {
      enabled: process.env.ENABLE_CROSS_SUBDOMAIN_COOKIES === "true",
      domain: process.env.COOKIE_DOMAIN,
    },

    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      // partitioned: true // New browser standards will mandate this for foreign cookies
    },
    database: {
      generateId: false,
    },
  },

  // Comprehensive trusted origins configuration
  trustedOrigins: buildTrustedOrigins(),

  // Base URL configuration
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  // Rate limiting configuration
  rateLimit: {
    enabled: true,
    // window: env.NODE_ENV === 'development' ? 60000 : env.RATE_LIMIT_WINDOW, // 1 minute
    // max: env.NODE_ENV === 'development' ? 1000 : env.RATE_LIMIT_MAX, // 1000 requests in dev, default in prod
  },
});

/**
 * Build trusted origins array with proper filtering and validation
 */
function buildTrustedOrigins(): string[] {
  const origins = [
    // Core application URL
    process.env.NEXT_PUBLIC_API_URL,
    "zakipro://",
    "zakiexpo://",

    // CORS origin
    process.env.CORS_ORIGIN,

    // Provider-specific origins
    ...(isProviderEnabled("apple") ? ["https://appleid.apple.com"] : []),

    // Environment-based origins
    ...getTrustedOriginsFromEnv(),

    // Development origins
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://localhost:5173", // Vite dev server
          "http://localhost:3001", // Alternative dev port
          "http://127.0.0.1:3000",
          "http://127.0.0.1:5173",
        ]
      : []),

    // Additional configured origins
    ...(process.env.ADDITIONAL_TRUSTED_ORIGINS?.split(",") || []),

    // Trusted origins from main config
    ...(process.env.TRUSTED_ORIGINS?.split(",") || []),
  ];

  // Filter out null, undefined, and empty strings, then remove duplicates
  return [
    ...new Set(
      origins
        .filter(
          (origin): origin is string =>
            origin !== null &&
            origin !== undefined &&
            typeof origin === "string" &&
            origin.trim() !== ""
        )
        .map((origin) => origin.trim())
    ),
  ];
}

// Export types for better TypeScript support with custom fields
export type User = typeof authConfig.$Infer.Session.user & {
  role?: "admin" | "physician" | "expert" | "viewer" | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  username?: string | null;
  displayUsername?: string | null;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  svixAppId?: string | null;
  bio?: string | null;
  isTwoFactorEnabled?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  deletedAt?: Date | null;
};

export type Session = typeof authConfig.$Infer.Session & {
  user: User;
};

// Export the configuration for use in other parts of the application
export default authConfig;
