import { Hono } from 'hono'
import { app as apiApp } from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

const app = new Hono()
app.route('/api', apiApp)

export default async function handler(req: Request): Promise<Response> {
  return app.fetch(req, process.env as Record<string, string>)
}
