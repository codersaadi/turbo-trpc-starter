import { sendEmail } from "../../../server/email/send";
import {
  magicLinkTemplate,
  signInTemplate,
  forgotPasswordTemplate,
} from "../../../server/email/templates/auth-email-templates";
import { BetterAuthPlugin } from "better-auth";
import {
  admin,
  openAPI,
  magicLink,
  jwt,
  multiSession,
  emailOTP,
  username,
  oneTap,
  twoFactor,
} from "better-auth/plugins";
import { expo } from "@better-auth/expo"; // Expo-specific auth not used in server context

const getNextCookiesPlugin = async () => {
  if (!process.env.NEXT_PUBLIC_DASHBOARD_EMBEDDED_MODE) {
    return null;
  }
  const nextCookies = (await import("better-auth/next-js")).nextCookies;
  return nextCookies();
};

/**
 * @file This file configures all authentication plugins for the application.
 * Each plugin is conditionally enabled based on environment variables,
 * allowing for a highly modular and configurable authentication system.
 * @see /src/config/env.ts for environment variable definitions.
 */

/**
 * Core plugins that are always enabled
 */
const corePlugins: BetterAuthPlugin[] = [
  /**
   * [CORE] Admin Plugin
   * Provides core administrative functionalities, including role management
   * and an optional admin UI for user management.
   */
  admin({
    defaultRole: "user",
    adminEmails: process.env.ADMIN_EMAILS?.split(",") || [],
    disableAdminUI:
      process.env.NODE_ENV === "production" && !process.env.ENABLE_ADMIN_UI,
  }),
  /**
   * [CORE] OpenAPI Documentation Plugin
   * Automatically generates and serves OpenAPI (Swagger) documentation for your auth routes.
   * Super helpful for API testing and for frontend developers.
   */
  openAPI({
    path: "/api/auth/docs",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description:
        "A modular, advanced authentication system powered by Better Auth.",
    },
    tags: ["Authentication", "Users", "Sessions", "Organizations", "Security"],
  }),

  /**
   * [CORE] Two-Factor Authentication Plugin
   * Provides TOTP-based 2FA for enhanced security
   * Users can enable 2FA in their account settings
   */
  twoFactor({
    issuer: "authts",
  }),

  /**
   * [CORE] Expo Plugin
   * Enables Better Auth to work with Expo React Native applications
   * Handles session management through secure storage
   */
  expo(),
];

/**
 * Feature plugins with their configurations
 */
const featurePlugins = {
  username: () => username(),

  // Email OTP disabled - using custom OTP workflow for email verification
  // Password reset and sign-in OTP can still use this if needed
  emailOTP: () =>
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "email-verification":
            // Skip - handled by custom workflow in auth.signup endpoint
            console.log(
              `[Email OTP] Skipping Better Auth email verification - using custom workflow`
            );
            break;
          case "forget-password":
            await sendEmail({
              to: email,
              subject: "Password Reset Code",
              react: forgotPasswordTemplate({
                type: "otp",
                code: otp,
                username: email.split("@")[0] || email,
              }) as any,
            });
            break;
          case "sign-in":
            await sendEmail({
              to: email,
              subject: "Sign In Code",
              react: signInTemplate({
                type: "otp",
                code: otp,
                username: email.split("@")[0] || email,
              }) as any,
            });
            break;
          default:
            break;
        }
        console.log(`[Email OTP] Sending ${type} OTP to ${email}: ${otp}`);
      },
      allowedAttempts: process.env.OTP_MAX_ATTEMPTS
        ? parseInt(process.env.OTP_MAX_ATTEMPTS, 10)
        : undefined,
      otpLength: parseInt(process.env.OTP_LENGTH || "6", 10),
      expiresIn:
        60 * (parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10) || 5), // 5 minutes
      sendVerificationOnSignUp: false, // Disabled - using custom signup workflow
    }),

  magicLink: () =>
    magicLink({
      async sendMagicLink(data, _req) {
        console.log(
          `[Magic Link] Sending link to ${data?.email}: ${data?.url}`
        );
        await sendEmail({
          to: data?.email,
          subject: "Your Magic Sign-In Link",
          from: process.env.EMAIL_FROM as string,
          react: magicLinkTemplate({
            type: "magic-link",
            link: data?.url,
            username: data.email?.split("@")?.[0] || data.email,
          }) as any,
        });
      },
      disableSignUp: !!process.env.DISABLE_SIGNUP,
      expiresIn:
        60 *
        (process.env.MAGIC_LINK_EXPIRY_MINUTES
          ? parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES, 10)
          : 15), // 15 minutes
    }),

  oneTap: () =>
    oneTap({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      disableSignup: !!process.env.DISABLE_SIGNUP,
    }),

  multiSession: () =>
    multiSession({
      maximumSessions: process.env.MAX_SESSIONS_PER_USER
        ? parseInt(process.env.MAX_SESSIONS_PER_USER, 10)
        : 10,
    }),

  jwt: () =>
    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER as string,
        audience: process.env.JWT_AUDIENCE as string,
        expirationTime: "15m",
        definePayload(session) {
          return {
            userId: session?.user?.id,
            email: session?.user?.email,
            name: session?.user?.name,
            role: session?.user?.role,
          };
        },
      },
    }),
  // POST FEATURE (LATE)
  // phoneNumber: () =>
  //   phoneNumber({
  //     async sendOTP(data, _req) {
  //       try {
  //         console.log(
  //           `[Phone Auth] Sending code to ${data.phoneNumber}: ${data.code}`
  //         );

  //         const smsService = getSMSService();
  //         if (!smsService) {
  //           console.warn('[Phone Auth] SMS service not available, skipping OTP send');
  //           throw new Error('SMS service not configured');
  //         }

  //         const result = await smsService.sendOTP(data.phoneNumber, data.code);

  //         if (!result.success) {
  //           console.error(`[Phone Auth] Failed to send SMS: ${result.error}`);
  //           throw new Error(result.error || 'Failed to send SMS');
  //         }

  //         console.log(
  //           `[Phone Auth] SMS sent successfully. Message ID: ${result.messageId}`
  //         );
  //       } catch (error) {
  //         console.error('[Phone Auth] Error sending SMS:', error);
  //         throw error;
  //       }
  //     },

  //     async sendPasswordResetOTP(data, _req) {
  //       try {
  //         console.log(
  //           `[Phone Auth] Sending password reset OTP to ${data.phoneNumber}: ${data.code}`
  //         );

  //         const smsService = getSMSService();
  //         if (!smsService) {
  //           console.warn('[Phone Auth] SMS service not available, skipping password reset OTP');
  //           throw new Error('SMS service not configured');
  //         }

  //         const result = await smsService.sendOTP(data.phoneNumber, data.code);

  //         if (!result.success) {
  //           console.error(`[Phone Auth] Failed to send SMS: ${result.error}`);
  //           throw new Error(result.error || 'Failed to send SMS');
  //         }

  //         console.log(
  //           `[Phone Auth] SMS sent successfully. Message ID: ${result.messageId}`
  //         );
  //       } catch (error) {
  //         console.error(
  //           '[Phone Auth] Error sending password reset SMS:',
  //           error
  //         );
  //         throw error;
  //       }
  //     },

  //     phoneNumberValidator(phoneNumber) {
  //       const result = phoneNumberValidator(phoneNumber, {
  //         defaultCountry: 'UA',
  //       });
  //       return result.isValid;
  //     },

  //     otpLength: env.PHONE_OTP_LENGTH as number,
  //     expiresIn: 60 * (env.PHONE_OTP_EXPIRY_MINUTES || 5),
  //   }),

  // nextCookies: () => nextCookies(),
};

/**
 * Plugin configuration mapping environment variables to plugin factories
 */
const pluginConfig = [
  { enabled: process.env.ENABLE_USERNAME, plugin: featurePlugins.username },
  { enabled: process.env.ENABLE_OTP, plugin: featurePlugins.emailOTP },
  { enabled: process.env.ENABLE_MAGIC_LINK, plugin: featurePlugins.magicLink },
  { enabled: process.env.ENABLE_ONE_TAP, plugin: featurePlugins.oneTap },
  {
    enabled: process.env.ENABLE_MULTI_SESSION,
    plugin: featurePlugins.multiSession,
  },
  { enabled: process.env.ENABLE_JWT, plugin: featurePlugins.jwt },
  // POST FEATURE (LATE)
  // { enabled: env.ENABLE_PHONE_AUTH, plugin: featurePlugins.phoneNumber },
] as const;

/**
 * Build the final plugins array by filtering enabled plugins
 */
export const buildAuthPlugins = async (): Promise<BetterAuthPlugin[]> => {
  const plugins: BetterAuthPlugin[] = [
    ...corePlugins,
    ...pluginConfig
      .filter(({ enabled }) => enabled)
      .map(({ plugin }) => plugin()),
  ];

  // Handle async nextCookies plugin separately
  if (process.env.NEXT_PUBLIC_DASHBOARD_EMBEDDED_MODE) {
    const nextCookiesPlugin = await getNextCookiesPlugin();
    if (nextCookiesPlugin) {
      plugins.push(nextCookiesPlugin);
    }
  }

  return plugins;
};

// For synchronous access, create a promise that resolves to the plugins
export const authPluginsPromise = buildAuthPlugins();

// For backwards compatibility, export a synchronous version without the async plugin
export const authPlugins: BetterAuthPlugin[] = [
  ...corePlugins,
  ...pluginConfig
    .filter(({ enabled }) => enabled)
    .map(({ plugin }) => plugin()),
];
