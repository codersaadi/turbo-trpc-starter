import { GoogleOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/google
// REDIRECT_URL : e.g http://localhost:3000/api/auth/callback/google
const google = {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  redirectURI: "zakipro://auth/callback/google",
  prompt: "select_account",

  // if needed
  // accessType :"offline"
} satisfies GoogleOptions;
export { google };

// If you want to use google one tap, you can use the One Tap Plugin guide.
// https://www.better-auth.com/docs/plugins/one-tap
