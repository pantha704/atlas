// ponytail: libsql native module stub. @libsql/client/http (Turso over HTTPS)
// is the only path we use. The sqlite3 fallback eagerly imports 'libsql' which
// has a native binding — Vercel's rollup commonjs plugin can't resolve its
// dynamic require of '@libsql/linux-x64-gnu'. Replacing with an empty stub
// keeps the bundle valid and the unreachable code inert.
export default {
  load: () => {
    throw new Error('libsql native stubbed — use @libsql/client/http')
  },
}
export const inTransaction = () => false
