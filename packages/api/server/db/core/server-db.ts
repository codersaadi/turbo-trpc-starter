import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../schema";
import { DrizzleDatabase } from "../client";
import { isDatabaseNeon, isServerMode, isCloudflareMode } from "@repo/env";
import dotconfig from "dotenv";
dotconfig.config();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodePool = any;
// Global connection pools to prevent connection leaks
let neonPool: NeonPool | null = null;
let nodePool: NodePool | null = null;

const getConnectionPoolConfig = () => ({
  // Connection pool settings for production-grade performance
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout for new connections (increased from 2s to 10s)
  maxUses: 7500, // Retire connections after 7500 uses
  allowExitOnIdle: false, // Keep pool alive for faster subsequent requests
});

export const getDBInstance = (): DrizzleDatabase => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      `You are trying to use database, but "DATABASE_URL" is not set correctly`
    );
  }

  // For NextJS/dashboard mode, Cloudflare mode, or when using Neon, always use Neon driver
  if (!isServerMode() || isDatabaseNeon() || isCloudflareMode()) {
    console.log(
      `Using Neon serverless database driver (server mode: ${isServerMode()}, cloudflare mode: ${isCloudflareMode()})`
    );

    // Only configure WebSocket for migrations in Node.js environments
    if (
      process.env.MIGRATION_DB === "1" &&
      typeof window === "undefined" &&
      !isCloudflareMode()
    ) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ws = require("ws");
      neonConfig.webSocketConstructor = ws;
    }

    // Reuse existing Neon pool or create new one with pooling config
    if (!neonPool) {
      neonPool = new NeonPool({
        connectionString,
        ...getConnectionPoolConfig(),
      });
    }

    return neonDrizzle(neonPool, { schema });
  }

  // Node.js driver with connection pooling
  console.log(`Using Node.js database driver (server mode: ${isServerMode()})`);

  if (!nodePool) {
    // const { drizzle: nodeDrizzle } = require('drizzle-orm/node-postgres');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool: NodePool } = require("pg");

    nodePool = new NodePool({
      connectionString,
      ...getConnectionPoolConfig(),
    });

    // Handle pool errors gracefully
    nodePool.on("error", (err: Error) => {
      console.error("Unexpected error on idle client", err);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: nodeDrizzle } = require("drizzle-orm/node-postgres");
  return nodeDrizzle(nodePool, { schema });
};

// Warmup function to establish initial connections
export const warmupDatabase = async (): Promise<void> => {
  try {
    const db = getDBInstance();

    // Execute a simple query to establish connection
    if (!isServerMode() || isDatabaseNeon() || isCloudflareMode()) {
      // For Neon, test with a simple query
      await db.execute("SELECT 1 as warmup");
    } else {
      // For Node.js PostgreSQL, test connection
      await db.execute("SELECT 1 as warmup");
    }

    console.log("✅ Database connection warmed up successfully");
  } catch (error) {
    console.error("❌ Database warmup failed:", error);
    // Don't throw - let the app continue and handle connection on first request
  }
};

// Graceful shutdown function
export const closeDatabase = async (): Promise<void> => {
  try {
    if (neonPool) {
      await neonPool.end();
      neonPool = null;
      console.log("✅ Neon database pool closed");
    }

    if (nodePool) {
      await nodePool.end();
      nodePool = null;
      console.log("✅ Node.js database pool closed");
    }
  } catch (error) {
    console.error("❌ Error closing database pools:", error);
  }
};
