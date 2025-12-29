/**
 * PgBoss Queue Workers
 */

import PgBoss from "pg-boss";
import { eq } from "drizzle-orm";
import { getQueue } from "./index";
import { createId } from "@paralleldrive/cuid2";

/**
 * Initialize all queue workers
 */
export async function initializeWorkers() {
  const queue = await getQueue();

  // Register all workers

  console.log("[PgBoss Workers] All workers initialized");
}
