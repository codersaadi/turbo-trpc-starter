/**
 * Queue System Initialization
 *
 * Call this on server startup to initialize PgBoss and register workers
 */

import { initQueue } from './index';
import { initializeWorkers } from './workers';

let initialized = false;

/**
 * Initialize the complete queue system
 * Safe to call multiple times - will only initialize once
 */
export async function initializeQueueSystem() {
  if (initialized) {
    console.log('[Queue System] Already initialized, skipping');
    return;
  }

  try {
    console.log('[Queue System] Starting initialization...');

    // Initialize PgBoss
    await initQueue();

    // Register all workers
    await initializeWorkers();

    initialized = true;
    console.log('[Queue System] Initialization complete');
  } catch (error) {
    console.error('[Queue System] Initialization failed:', error);
    throw error;
  }
}

/**
 * Check if queue system is initialized
 */
export function isQueueInitialized(): boolean {
  return initialized;
}
