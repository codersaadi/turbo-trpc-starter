import {

  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
    image: text('image'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    role: text('role'),
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    username: varchar('username', { length: 50 }).unique(),
    displayUsername: text("display_username"),
    phoneNumber: text("phone_number").unique(),
    phoneNumberVerified: boolean("phone_number_verified"),
    svixAppId: text('svix_app_id').unique(),
    bio: text('bio'),
    isTwoFactorEnabled: boolean('is_two_factor_enabled')
      .default(false)
      .notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  t => [
    index('user_email_idx').on(t.email),
    index('user_username_idx').on(t.username),
    index('user_deleted_at_idx').on(t.deletedAt),
  ]
);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const jwks = pgTable('jwks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
});