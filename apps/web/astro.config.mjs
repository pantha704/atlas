import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://atlas.pages.dev',
  vite: { plugins: [tailwindcss()] },
})
