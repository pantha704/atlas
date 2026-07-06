import { handle } from 'hono/node-server/vercel'
import { app as apiApp } from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

export default handle(apiApp)
