import { apple } from './apple';
import { facebook } from './facebook';
import { google } from './google';

export const allProviders = {
  google,
  apple,
  facebook
} as const;

export type ProviderName = keyof typeof allProviders;
export type ProviderConfig = (typeof allProviders)[ProviderName];

export {
  getAuthProviders,
  getEnabledProviderNames,
  getProviderConfig,
  isProviderEnabled,
  type AuthConfigError,
  type AuthProvider,
} from './provider_helpers';
