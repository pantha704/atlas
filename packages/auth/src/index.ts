// Atlas auth — lightweight GitHub OAuth + JWT sessions.
// ponytail: no Better-Auth dependency. GitHub OAuth is the primary method for devs.
// JWT in httpOnly cookie. Sessions stored in DB for revocation.
// Email auth deferred (Resend OTP) — add when needed.

import type { DB } from '@atlas/db'
import { sessions, users } from '@atlas/db'
import { eq } from 'drizzle-orm'

export interface AuthEnv {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  BETTER_AUTH_SECRET: string
  APP_URL: string // e.g. https://atlas.pages.dev
}

export interface SessionUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro'
}

export interface AuthResult {
  user: SessionUser
  token: string
}

// ===== GitHub OAuth =====

export function githubAuthUrl(env: AuthEnv, state: string): string {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/auth/callback`,
    scope: 'read:user user:email',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeGithubCode(
  code: string,
  env: AuthEnv,
): Promise<{ accessToken: string } | null> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!data.access_token) return null
  return { accessToken: data.access_token }
}

export async function fetchGithubUser(accessToken: string): Promise<GHUser | null> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Atlas-Auth',
    },
  })
  if (!res.ok) return null
  return (await res.json()) as GHUser
}

export async function fetchGithubEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Atlas-Auth',
    },
  })
  if (!res.ok) return null
  const emails = (await res.json()) as Array<{ email: string; primary: boolean; verified: boolean }>
  const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified)
  return primary?.email ?? null
}

interface GHUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

// ===== DB user upsert =====

export async function upsertUserFromGithub(
  db: DB,
  ghUser: GHUser,
  email: string,
): Promise<SessionUser> {
  const githubId = String(ghUser.id)
  // Check if user exists by email
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    const u = existing[0]
    if (!u) throw new Error('user fetch failed')
    return { id: u.id, email: u.email, name: u.name, plan: u.plan as 'free' | 'pro' }
  }
  // Create new user
  const id = crypto.randomUUID()
  const name = ghUser.name || ghUser.login
  await db.insert(users).values({ id, email, name, plan: 'free' })
  return { id, email, name, plan: 'free' }
}

// ===== JWT sessions (HMAC-SHA256, Web Crypto) =====

export async function createSessionToken(user: SessionUser, secret: string): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days
  }
  const header = { alg: 'HS256', typ: 'JWT' }
  const encHeader = base64url(JSON.stringify(header))
  const encPayload = base64url(JSON.stringify(payload))
  const data = `${encHeader}.${encPayload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const encSig = base64url(String.fromCharCode(...new Uint8Array(sig)))
  return `${data}.${encSig}`
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionUser | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [encHeader, encPayload, encSig] = parts as [string, string, string]
  const data = `${encHeader}.${encPayload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expectedSig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const expectedEncSig = base64url(String.fromCharCode(...new Uint8Array(expectedSig)))
  // ponytail: constant-time comparison would be ideal; crypto.subtle.timingSafeEqual not available in all runtimes
  if (encSig !== expectedEncSig) return null
  try {
    const payload = JSON.parse(base64urlDecode(encPayload)) as {
      sub: string
      email: string
      name: string
      plan: 'free' | 'pro'
      exp: number
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return { id: payload.sub, email: payload.email, name: payload.name, plan: payload.plan }
  } catch {
    return null
  }
}

// ===== Session DB persistence (for revocation) =====

export async function createDbSession(db: DB, userId: string, token: string): Promise<void> {
  const id = crypto.randomUUID()
  // ponytail: store token hash, not raw token
  const tokenHash = await shortHash(token)
  await db.insert(sessions).values({
    id,
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  })
}

export async function revokeDbSession(db: DB, token: string): Promise<void> {
  const tokenHash = await shortHash(token)
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash))
}

// ===== Cookie helpers =====

export const SESSION_COOKIE = 'atlas_session'
const COOKIE_MAX_AGE = 30 * 24 * 3600 // 30 days

export function setSessionCookie(token: string, secure: boolean): string {
  const flags = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (secure) flags.push('Secure')
  return flags.join('; ')
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
}

export function extractSessionToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match?.[1] ?? null
}

// ===== Middleware: requireAuth =====

export async function requireAuth(
  request: Request,
  env: AuthEnv,
  db: DB,
): Promise<SessionUser | null> {
  const token = extractSessionToken(request.headers.get('cookie'))
  if (!token) return null
  const session = await verifySessionToken(token, env.BETTER_AUTH_SECRET)
  if (!session) return null
  // Refresh plan from DB (Stripe upgrade / trial expiry) — JWT plan can be stale
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      plan: users.plan,
      trialEndsAt: users.trialEndsAt,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1)
  const u = rows[0]
  if (!u) return null
  let plan = u.plan as 'free' | 'pro'
  if (plan === 'pro' && u.trialEndsAt && new Date(u.trialEndsAt) < new Date()) {
    await db.update(users).set({ plan: 'free', trialEndsAt: null }).where(eq(users.id, u.id))
    plan = 'free'
  }
  return { id: u.id, email: u.email, name: u.name, plan }
}

// ===== Helpers =====

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4
  const fixed = pad ? padded + '='.repeat(4 - pad) : padded
  return atob(fixed)
}

async function shortHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex.slice(0, 16)
}
