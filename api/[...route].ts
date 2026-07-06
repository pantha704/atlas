import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { app as apiApp } from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

const wrapper = new Hono()
wrapper.route('/api', apiApp)

export default handle(wrapper)
