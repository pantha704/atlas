import { type Client, createClient } from '@libsql/client/http'
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export type DB = LibSQLDatabase<typeof schema>

// ponytail: use @libsql/client/http — remote-only, no native binding.
// Turso URLs (libsql://) reach the host via HTTPS this way, sidestepping
// the libsql native require that breaks Vercel bundling.
export function createDB(opts: { url: string; authToken?: string }): { db: DB; client: Client } {
  const client = createClient({ url: opts.url, authToken: opts.authToken })
  return { db: drizzle(client, { schema }), client }
}

export * from './schema'
