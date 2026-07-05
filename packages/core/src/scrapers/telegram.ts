// Telegram scraper — TS port of code/src/scrapers/telegram.py.
// Uses Cloudflare's native HTMLRewriter (zero dep, perfect for Workers — no DOMParser).
// Scrapes public channel preview at https://t.me/s/{channel}.

import type { ContentItem, TelegramConfig } from '../types'
import { makeItem } from '../types'
import { parseDate } from '../util'
import { type Scraper, fetchText } from './base'

const TELEGRAM_WEB_BASE = 'https://t.me/s'
const USER_AGENT = 'Mozilla/5.0 (compatible; Atlas/0.1; +https://github.com/pantha704/atlas)'

interface TgMessage {
  post: string
  datetime: string | null
  text: string | null
  externalHref: string | null
}

export class TelegramScraper implements Scraper {
  readonly sourceType = 'telegram' as const
  constructor(private cfg: TelegramConfig) {}

  async fetch(since: Date): Promise<ContentItem[]> {
    if (!this.cfg.enabled) return []
    const tasks = this.cfg.channels
      .filter((c) => c.enabled)
      .map((c) => this.fetchChannel(c.channel, c.fetchLimit, since))
    if (!tasks.length) return []

    const results = await Promise.allSettled(tasks)
    const items: ContentItem[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') items.push(...r.value)
    }
    return items
  }

  private async fetchChannel(
    channel: string,
    fetchLimit: number,
    since: Date,
  ): Promise<ContentItem[]> {
    const url = `${TELEGRAM_WEB_BASE}/${channel}`
    const headers: Record<string, string> = { 'User-Agent': USER_AGENT }
    const html = await fetchText(url, { headers, redirect: 'follow' }, { timeoutMs: 120000 })
    if (!html) return []

    const messages = parseTelegramHtml(html)
    const items: ContentItem[] = []
    for (const msg of messages.slice(-fetchLimit)) {
      const item = this.parseMessage(msg, channel, since)
      if (item) items.push(item)
    }
    return items
  }

  private parseMessage(msg: TgMessage, channel: string, since: Date): ContentItem | null {
    const post = msg.post
    const msgId = post.includes('/') ? (post.split('/').pop() ?? post) : post
    if (!msgId) return null
    if (!msg.datetime) return null
    const publishedAt = parseDate(msg.datetime)
    if (!publishedAt || new Date(publishedAt) < since) return null

    const text = (msg.text ?? '').trim()
    if (!text) return null

    const title = makeTitle(text)
    const msgUrl = `https://t.me/${channel}/${msgId}`
    const canonicalUrl = msg.externalHref ?? msgUrl

    return makeItem({
      sourceType: 'telegram',
      subtype: channel,
      nativeId: msgId,
      title,
      url: canonicalUrl,
      content: text,
      author: channel,
      publishedAt,
      metadata: { msgUrl, channel },
    })
  }
}

// Streaming extraction via HTMLRewriter. State machine:
// - On message div start: flush previous, start new
// - On time[datetime] inside message: capture timestamp
// - On message_text start/end: toggle text capture; on end, save buffer to current.text
// - On <br> inside text: append newline
// - On <a href> inside text: capture first external link
function parseTelegramHtml(html: string): TgMessage[] {
  const messages: TgMessage[] = []
  let current: TgMessage | null = null
  let inText = false
  let textBuffer = ''
  let firstExternalLink: string | null = null

  const flushCurrent = () => {
    if (current) {
      current.text = textBuffer.trim() || null
      current.externalHref = firstExternalLink
      messages.push(current)
    }
    current = null
    textBuffer = ''
    firstExternalLink = null
    inText = false
  }

  const rewriter = new HTMLRewriter()
    .on('div.tgme_widget_message[data-post]', {
      element(el) {
        flushCurrent()
        current = {
          post: el.getAttribute('data-post') ?? '',
          datetime: null,
          text: null,
          externalHref: null,
        }
      },
    })
    .on('div.tgme_widget_message time[datetime]', {
      element(el) {
        const dt = el.getAttribute('datetime')
        if (current && dt) current.datetime = dt
      },
    })
    .on('div.tgme_widget_message_text', {
      element(el) {
        inText = true
        el.onEndTag(() => {
          if (current) current.text = textBuffer.trim() || null
          inText = false
        })
      },
      text(chunk) {
        if (inText) textBuffer += chunk.text
      },
    })
    .on('br', {
      element() {
        if (inText) textBuffer += '\n'
      },
    })
    .on('div.tgme_widget_message_text a[href]', {
      element(el) {
        if (!inText) return
        const href = el.getAttribute('href') ?? ''
        if (!firstExternalLink && href.startsWith('http') && !href.includes('t.me')) {
          firstExternalLink = href
        }
      },
    })

  rewriter.transform(new Response(html))
  flushCurrent()
  return messages
}

function makeTitle(text: string): string {
  const first = text.split('\n\n')[0]
  const firstPara = (first ?? text).replace(/\n/g, ' ').trim()
  if (firstPara.length <= 80) return firstPara
  const match = firstPara.slice(0, 80).match(/[。！？]/)
  if (match && typeof match.index === 'number' && match.index >= 0) {
    return firstPara.slice(0, match.index + 1)
  }
  return firstPara.slice(0, 80)
}
