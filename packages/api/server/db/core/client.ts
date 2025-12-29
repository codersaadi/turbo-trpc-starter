import { DrizzleDatabase } from '../client';
import { getDBInstance } from './server-db';

let cachedDB: DrizzleDatabase | null = null;

export const getServerDB = ( ): DrizzleDatabase => {
  if (cachedDB) return cachedDB;
  try {
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);

    throw error;
  }
};

export const serverDB = getDBInstance();
