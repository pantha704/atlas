import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import vercel from '@astrojs/vercel'

const STUB = fileURLToPath(new URL('./src/lib/sqlite-stub.mjs', import.meta.url))

export default defineConfig({
  site: 'https://atlas-nine-ashy.vercel.app',
  output: 'server',
  adapter: vercel(),
  // JSON API POSTs from the same app (fetch without form Content-Type) are blocked by
  // Astro's default origin check on Vercel ("Cross-site POST form submissions are forbidden").
  // Session cookies are SameSite; API auth is cookie/Bearer-based.
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^libsql$/,
          replacement: STUB,
        },
      ],
    },
  },
})
