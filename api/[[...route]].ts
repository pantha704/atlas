import apiApp from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

export default async function handler(req: Request): Promise<Response> {
  return apiApp.fetch(req, process.env as Record<string, string>)
}
