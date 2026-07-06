import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://atlas-nine-ashy.vercel.app',
  vite: { plugins: [tailwindcss()] },
})
