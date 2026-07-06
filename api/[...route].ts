import { handle } from 'hono/vercel'
import { Hono } from 'hono'
// ponytail: CJS bundle avoids ESM circular dep issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundle = require('./_bundle.cjs')
const apiApp = bundle.app

export const config = { runtime: 'nodejs' }

const wrapper = new Hono()
wrapper.route('/api', apiApp)

export default handle(wrapper)
