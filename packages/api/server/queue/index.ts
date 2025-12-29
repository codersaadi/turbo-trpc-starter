/**
 * PgBoss Queue Configuration
 *
 * Handles background job processing:
 * - Email notifications
 * - File processing
 * - License verification workflows
 * - Expert review reminders
 *
 * @see https://github.com/timgit/pg-boss
 */

import PgBoss from "pg-boss";

let boss: PgBoss | null = null;

/**
 * Initialize PgBoss instance
 */
export async function initQueue() {
  if (boss) {
    return boss;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PgBoss");
  }

  boss = new PgBoss({
    connectionString,
    // Use a separate schema for PgBoss tables
    schema: "pgboss",
    // Note: Job retention is now configured per-queue using createQueue()
    // with retentionSeconds or deleteAfterSeconds options
  });

  boss.on("error", (error) => {
    console.error("[PgBoss] Error:", error);
  });

  await boss.start();
  console.log("[PgBoss] Started successfully");

  return boss;
}

/**
 * Get PgBoss instance
 */
export async function getQueue(): Promise<PgBoss> {
  if (!boss) {
    return initQueue();
  }
  return boss;
}

/**
 * Graceful shutdown
 */
export async function stopQueue() {
  if (boss) {
    await boss.stop();
    boss = null;
    console.log("[PgBoss] Stopped");
  }
}

// Handle process termination
if (typeof process !== "undefined") {
  process.on("SIGTERM", stopQueue);
  process.on("SIGINT", stopQueue);
}
