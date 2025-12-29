
import { allProviders, ProviderConfig, ProviderName } from '.';

export type AuthProvider = {
  name: ProviderName;
  config: ProviderConfig;
};

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConfigError';
  }
}

const parseAuthProviders = (providerString?: string): ProviderName[] => {
  if (!providerString) {
    return [];
  }

  const providers = providerString
    .split(',')
    .map(provider => provider.trim().toLowerCase() as ProviderName)
    .filter(provider => provider.length > 0);

  // Validate that all providers are supported
  const supportedProviders = Object.keys(allProviders) as ProviderName[];
  const unsupportedProviders = providers.filter(
    provider => !supportedProviders.includes(provider)
  );

  if (unsupportedProviders.length > 0) {
    throw new AuthConfigError(
      `Unsupported auth providers: ${unsupportedProviders.join(', ')}. ` +
        `Supported providers: ${supportedProviders.join(', ')}`
    );
  }

  return providers;
};

const getAuthProviders = (): Record<string, ProviderConfig> => {
  const enabledProviderNames = parseAuthProviders("google,facebook");

  if (enabledProviderNames.length === 0) {
    return {};
  }

  const providers: AuthProvider[] = [];

  for (const providerName of enabledProviderNames) {
    const providerConfig = allProviders[providerName];

    // Skip null providers (like disabled tiktok)
    if (!providerConfig) {
      continue;
    }

    // Validate that required credentials are present
    if (!providerConfig.clientId || !providerConfig.clientSecret || 
        providerConfig.clientId === 'not-configured' || providerConfig.clientSecret === 'not-configured') {
      throw new AuthConfigError(
        `Missing credentials for ${providerName} provider. ` +
          `Please set ${providerName.toUpperCase()}_CLIENT_ID and ${providerName.toUpperCase()}_CLIENT_SECRET`
      );
    }

    providers.push({
      name: providerName,
      config: providerConfig,
    });
  }

  return providers.reduce(
    (acc, { name, config }) => {
      acc[name] = config;
      return acc;
    },
    {} as Record<string, ProviderConfig>
  );
};

const getEnabledProviderNames = (): ProviderName[] => {
  return parseAuthProviders(process.env.AUTH_PROVIDERS);
};

const isProviderEnabled = (providerName: ProviderName): boolean => {
  const enabledProviders = getEnabledProviderNames();
  return enabledProviders.includes(providerName);
};

// Utility to get a specific provider config
const getProviderConfig = <T extends ProviderName>(
  providerName: T
): ProviderConfig | null => {
  if (!isProviderEnabled(providerName)) {
    return null;
  }
  return allProviders[providerName];
};
export {
  getAuthProviders,
  getEnabledProviderNames,
  getProviderConfig,
  isProviderEnabled,
};
