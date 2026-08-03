// Email delivery via Resend REST API. ponytail: fetch-based, no SDK dep.
// Free tier: 100 emails/day, 3k/month. Env: RESEND_API_KEY, RESEND_FROM_EMAIL.

import { renderDigestMarkdown } from '@atlas/core'

export interface EmailEnv {
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
}

export async function sendDigestEmail(
  to: string,
  subject: string,
  digestMd: string,
  env: EmailEnv,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' }
  const html = renderEmailHtml(digestMd, subject)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL ?? 'Atlas <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` }
  }
  return { ok: true }
}

// Email-safe HTML wrapper. Inline styles only — no external CSS.
export function renderEmailHtml(digestMd: string, title: string): string {
  const body = renderDigestMarkdown(digestMd)
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Inter,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:24px 32px;border-bottom:1px solid #e7e3dc;">
    <span style="font-size:20px;font-weight:800;color:#1e1b2e;">Atlas</span>
    <span style="font-size:14px;color:#6b6580;margin-left:12px;">${esc(title)}</span>
  </td></tr>
  <tr><td style="padding:24px 32px;font-size:15px;line-height:1.6;color:#1e1b2e;">
    ${body}
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid #e7e3dc;background:#f4f2ef;">
    <span style="font-size:12px;color:#6b6580;">Powered by <a href="https://atlas-nine-ashy.vercel.app" style="color:#4f46e5;text-decoration:none;">Atlas</a></span>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
