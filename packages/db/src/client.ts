import { type Client, createClient } from '@libsql/client'
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export type DB = LibSQLDatabase<typeof schema>

export function createDB(opts: { url: string; authToken?: string }): { db: DB; client: Client } {
  const client = createClient({ url: opts.url, authToken: opts.authToken })
  return { db: drizzle(client, { schema }), client }
}

export * from './schema'
