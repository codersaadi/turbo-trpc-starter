export const isServerMode = () =>
  process.env.NEXT_PUBLIC_SERVICE_MODE === "server";
export const isCloudflareMode = () => {
  return (
    (typeof globalThis !== "undefined" &&
      typeof globalThis.navigator !== "undefined" &&
      globalThis.navigator.userAgent === "Cloudflare-Workers") ||
    typeof process === "undefined" ||
    process.env.CF_PAGES === "1" ||
    process.env.CLOUDFLARE_WORKERS === "1" ||
    process.env.DEPLOYMENT_MODE === "cloudflare"
  );
};
export const isDatabaseNeon = () =>
  process.env.DATABASE_DRIVER === "neon" || isCloudflareMode();
// Enhanced utility functions with better type safety
export const isProduction = (): boolean =>
  process.env.NODE_ENV === "production";
export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === "development";
export const isTest = (): boolean => process.env.NODE_ENV === "test";

// Database connection utilities
export const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const sslParam = process.env.DB_SSL ? "?sslmode=require" : "";
  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}${sslParam}`;
};

// Redis connection utilities
export const getRedisUrl = (): string => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  let auth = "";
  if (process.env.REDIS_USERNAME && process.env.REDIS_PASSWORD) {
    auth = `${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@`;
  } else if (process.env.REDIS_PASSWORD) {
    auth = `:${process.env.REDIS_PASSWORD}@`;
  }

  return `redis://${auth}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`;
};

// Configuration objects for different services
export const getDatabaseConfig = () => ({
  url: getDatabaseUrl(),
  ssl: process.env.DB_SSL,
  pool: {
    min: process.env.DB_POOL_MIN,
    max: process.env.DB_POOL_MAX,
  },
  connection: {
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT,
  },
});

export const getRedisConfig = () => ({
  url: getRedisUrl(),
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
  username: process.env.REDIS_USERNAME,
});

export const getQueueConfig = () => ({
  connectionString: getDatabaseUrl(),
  retryLimit: process.env.QUEUE_RETRY_LIMIT || 3,
  retryDelay: process.env.QUEUE_RETRY_DELAY || 30,
  retryBackoff: process.env.QUEUE_RETRY_BACKOFF ?? true,
  expireInHours: process.env.QUEUE_MAX_EXPIRY_HOURS || 12,
  archiveCompletedAfterSeconds:
    (parseInt(process.env.QUEUE_ARCHIVE_COMPLETED_HOURS || "24", 10) || 24) *
    60 *
    60,
  deleteAfterDays: process.env.QUEUE_DELETE_AFTER_DAYS || 7,
  maintenanceIntervalSeconds: Math.max(
    (parseInt(process.env.QUEUE_MAINTENANCE_INTERVAL_MINUTES || "60", 10) ||
      60) * 60,
    1
  ),
  schema: process.env.QUEUE_SCHEMA || "pgboss",
});

export const getServerConfig = () => ({
  host: process.env.HOST,
  port: process.env.PORT,
  cors: {
    origin: getAllTrustedOrigins(),
    credentials: true,
  },
  rateLimit: {
    max: process.env.RATE_LIMIT_MAX,
    timeWindow: process.env.RATE_LIMIT_WINDOW,
  },
  logger: {
    level: process.env.LOG_LEVEL,
    transport:
      isDevelopment() &&
      process.env.LOG_PRETTY &&
      !process.env.VERCEL &&
      !process.env.AWS_LAMBDA_FUNCTION_NAME
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
});

export const getApiConfig = () => ({
  version: process.env.API_VERSION,
  prefix: process.env.API_PREFIX,
  healthCheck: {
    interval: process.env.HEALTH_CHECK_INTERVAL,
  },
});

// Enhanced trusted origins handling
export const getTrustedOriginsFromEnv = (): string[] => {
  if (!process.env.TRUSTED_ORIGINS) {
    return [];
  }

  return process.env.TRUSTED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => {
      if (!origin) return false;

      try {
        URL.canParse(origin);
        return true;
      } catch {
        console.warn(`⚠️  Invalid URL in TRUSTED_ORIGINS: ${origin}`);
        return false;
      }
    });
};

export const getAllTrustedOrigins = (): string[] => {
  const origins = new Set<string>();

  // Add primary CORS origin (use getAppUrl() for dynamic detection)
  origins.add(getCorsOrigin());

  // Add auth URL if configured
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const authUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
      origins.add(`${authUrl.protocol}//${authUrl.host}`);
    } catch {
      console.warn("⚠️  Invalid NEXT_PUBLIC_API_URL format");
    }
  }

  // Add additional trusted origins
  getTrustedOriginsFromEnv().forEach((origin) => origins.add(origin));

  return Array.from(origins);
};

// Feature flags
export const isRedisEnabled = (): boolean => !!process.env.ENABLE_REDIS;
export const isWebSocketEnabled = (): boolean => !!process.env.ENABLE_WEBSOCKET;
export const isEmailPasswordEnabled = (): boolean =>
  !!process.env.ENABLE_EMAIL_PASSWORD;
export const isSignupDisabled = (): boolean => !!process.env.DISABLE_SIGNUP;
export const isQueueEnabled = (): boolean => !!process.env.ENABLE_QUEUE;
export const featureFlags = {
  NOTIFICATIONS_PUSH_ENABLED:
    process.env.NOTIFICATIONS_PUSH_ENABLED !== "false",
  NOTIFICATIONS_EMAIL_ENABLED:
    process.env.NOTIFICATIONS_EMAIL_ENABLED !== "false",
  NOTIFICATIONS_SMS_ENABLED: process.env.NOTIFICATIONS_SMS_ENABLED === "true",
};

// URL utility functions - with dynamic URL detection for deployment platforms
export const getAppUrl = () => {
  // Priority order: explicit APP_URL > VERCEL_URL > RAILWAY_PUBLIC_DOMAIN > localhost
  return (
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : undefined) ||
    (process.env.RENDER_EXTERNAL_URL
      ? process.env.RENDER_EXTERNAL_URL
      : undefined) ||
    "http://localhost:3000"
  );
};

export const getApiUrl = () => `${getAppUrl()}${process.env.API_PREFIX}`;

export const getAuthUrl = () => process.env.NEXT_PUBLIC_API_URL;

export const getCorsOrigin = () => process.env.CORS_ORIGIN || getAppUrl();
export const getJwtIssuer = () => process.env.JWT_ISSUER || getAppUrl();

export const getPublicFrontendUrl = () =>
  process.env.NEXT_PUBLIC_FRONTEND_URL || getAppUrl();

// Deployment mode utilities
export const isStandaloneMode = (): boolean =>
  process.env.DEPLOYMENT_MODE === "standalone";
