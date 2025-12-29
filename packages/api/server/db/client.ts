import { ExtractTablesWithRelations } from 'drizzle-orm';
import {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';

import * as schema from './schema';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

// Define a union type for the possible database instances
// Use the specific Drizzle types for better intellisense
export type DrizzleDatabase =
  | NodePgDatabase<typeof schema>
  | NeonDatabase<typeof schema>;

export type DrizzleSchema = typeof schema;
export type DBTransaction = PgTransaction<
  NodePgQueryResultHKT,
  DrizzleSchema,
  ExtractTablesWithRelations<DrizzleSchema>
>;
