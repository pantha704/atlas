import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import vercel from '@astrojs/vercel'

const STUB = fileURLToPath(new URL('./src/lib/sqlite-stub.mjs', import.meta.url))

export default defineConfig({
  site: 'https://atlas-nine-ashy.vercel.app',
  output: 'server',
  adapter: vercel(),
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
