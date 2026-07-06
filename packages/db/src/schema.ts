import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ===== Atlas schema v0.1 =====
// Per-user scoring is the moat: items fetched globally, scored per user.
// Score tiers: high (>=9) emerald, good (>=7) teal, mid (>=5) amber, low (<5) slate.

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  plan: text('plan', { enum: ['free', 'pro'] })
    .notNull()
    .default('free'),
  // ponytail: prefs_json as text — promote to JSON column if we add postgres later
  prefs: text('prefs_json'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['hackernews', 'rss', 'github', 'arxiv', 'reddit', 'telegram', 'ossinsight'],
  }).notNull(),
  config: text('config_json').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => sources.id, { onDelete: 'cascade' }),
  externalId: text('external_id').notNull(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  author: text('author'),
  publishedAt: text('published_at').notNull(),
  raw: text('raw'),
  fetchedAt: text('fetched_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const scores = sqliteTable('scores', {
  id: text('id').primaryKey(),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  reason: text('reason').notNull(),
  tags: text('tags_json'),
  // v0.3: impact reasoning result (nullable — only set for top-N items per user)
  impact: text('impact_json'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  signal: text('signal', { enum: ['up', 'down', 'dismiss', 'bookmark'] }).notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const profiles = sqliteTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  interests: text('interests_text'),
  stack: text('stack_json'),
  embedding: text('embedding'),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  // v0.4: delivery preferences + RSS token
  rssToken: text('rss_token').unique(),
  deliveryPrefs: text('delivery_prefs_json'),
})

export const digests = sqliteTable('digests', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  items: text('items_json').notNull(),
  renderedMd: text('rendered_md'),
  deliveredAt: text('delivered_at'),
})

export const deliveries = sqliteTable('deliveries', {
  id: text('id').primaryKey(),
  digestId: text('digest_id').references(() => digests.id, { onDelete: 'cascade' }),
  channel: text('channel', { enum: ['web', 'email', 'rss', 'webhook'] }).notNull(),
  status: text('status', { enum: ['pending', 'sent', 'failed'] })
    .notNull()
    .default('pending'),
  sentAt: text('sent_at'),
})

export const runs = sqliteTable('runs', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['fetch', 'score', 'enrich', 'digest', 'deliver', 'full'] }).notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  status: text('status', { enum: ['running', 'ok', 'error'] })
    .notNull()
    .default('running'),
  logs: text('logs_json'),
})

export const audit = sqliteTable('audit', {
  id: text('id').primaryKey(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  target: text('target'),
  meta: text('meta_json'),
  at: text('at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// v1.1: Team workspaces
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member'] })
    .notNull()
    .default('member'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// v0.6: Public digest sharing
export const shares = sqliteTable('shares', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  digestId: text('digest_id').references(() => digests.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// v0.6: Referral tracking
export const referrals = sqliteTable('referrals', {
  id: text('id').primaryKey(),
  referrerId: text('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referredId: text('referred_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reward: text('reward'),
  status: text('status', { enum: ['pending', 'credited'] })
    .notNull()
    .default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

// v0.5: Source market — public directory of sources
export const publicSources = sqliteTable('public_sources', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['hackernews', 'rss', 'github', 'arxiv', 'reddit', 'telegram', 'ossinsight'],
  }).notNull(),
  configJson: text('config_json').notNull(),
  name: text('name').notNull(),
  bio: text('bio'),
  fieldTags: text('field_tags'),
  contributorId: text('contributor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  contributorCount: integer('contributor_count').notNull().default(1),
  userCount: integer('user_count').notNull().default(0),
  avgScore: integer('avg_score').notNull().default(0),
  snr: integer('snr').notNull().default(0),
  status: text('status', { enum: ['online', 'pending', 'deprecated'] })
    .notNull()
    .default('online'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const contributions = sqliteTable('contributions', {
  id: text('id').primaryKey(),
  sourceId: text('source_id')
    .notNull()
    .references(() => publicSources.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action', { enum: ['submit', 'vouch', 'flag'] }).notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type User = typeof users.$inferInsert
export type Session = typeof sessions.$inferInsert
export type Source = typeof sources.$inferInsert
export type Item = typeof items.$inferInsert
export type Score = typeof scores.$inferInsert
export type Feedback = typeof feedback.$inferInsert
export type Profile = typeof profiles.$inferInsert
export type Digest = typeof digests.$inferInsert
export type Delivery = typeof deliveries.$inferInsert
export type Run = typeof runs.$inferInsert
export type Audit = typeof audit.$inferInsert
export type PublicSource = typeof publicSources.$inferInsert
export type Contribution = typeof contributions.$inferInsert
export type Share = typeof shares.$inferInsert
export type Referral = typeof referrals.$inferInsert
export type Team = typeof teams.$inferInsert
export type TeamMember = typeof teamMembers.$inferInsert
