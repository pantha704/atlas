import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { app as apiApp } from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

const app = new Hono()
app.route('/api', apiApp)

export default handle(app)
