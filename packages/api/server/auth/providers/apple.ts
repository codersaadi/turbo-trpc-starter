import type { AppleOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/apple
export const apple: AppleOptions = {
  clientId: process.env.APPLE_CLIENT_ID!,
  clientSecret: process.env.APPLE_CLIENT_SECRET!,
  // Optional
  appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
};
