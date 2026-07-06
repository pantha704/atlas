import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://atlas-nine-ashy.vercel.app',
  output: 'server',
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
})
