// Daily summarizer — TS port of code/src/ai/summarizer.py DailySummarizer.
// Pure Markdown render — no AI call. Fixes original flaws:
// - TOC anchors now use real heading ids (id="item-N" on headings, not just TOC hrefs)
// - Empty discussion omitted (no "There is currently no community discussion available")
// - Score format supports both ⭐️ (with VS16) and ⭐ (without) — badge JS handles both

import type { ContentItem } from '../types'
import { pangu } from '../util'

interface Labels {
  header: string
  selected: (n: number, total: number) => string
  background: string
  discussion: string
  tags: string
  references: string
  empty: string
  emptyBody: string
}

const LABELS: Record<'en' | 'zh', Labels> = {
  en: {
    header: 'Atlas Daily',
    selected: (n, total) => `From ${total} items, ${n} important content pieces were selected`,
    background: 'Background',
    discussion: 'Discussion',
    tags: 'Tags',
    references: 'References',
    empty: 'No items met the importance threshold today.',
    emptyBody:
      'This usually means the sources were quiet or community engagement was low. The next run is scheduled for tomorrow — connect more sources in your dashboard to broaden the net.',
  },
  zh: {
    header: 'Atlas 每日速递',
    selected: (n, total) => `从 ${total} 条内容中筛选出 ${n} 条重要资讯`,
    background: '背景',
    discussion: '讨论',
    tags: '标签',
    references: '参考',
    empty: '今日没有内容达到重要性阈值。',
    emptyBody:
      '这通常意味着信息源较安静或社区互动较低。下一次运行安排在明天 — 在仪表盘中连接更多来源以扩大覆盖范围。',
  },
}

export class DailySummarizer {
  async generateSummary(
    items: ContentItem[],
    date: string,
    totalFetched: number,
    language: 'en' | 'zh' = 'en',
  ): Promise<string> {
    const labels = LABELS[language] ?? LABELS.en

    if (!items.length) return this.generateEmptySummary(date, totalFetched, labels)

    const header = `# ${labels.header} - ${date}\n\n> ${labels.selected(items.length, totalFetched)}\n\n---\n\n`

    // TOC — anchors match heading ids (item-1, item-2, ...)
    const tocEntries = items.map((item, i) => {
      const title = sanitizeTitle(getLocalizedTitle(item, language))
      const displayTitle = language === 'zh' ? pangu(title) : title
      const score = item.aiScore ?? '?'
      return `${i + 1}. [${displayTitle}](#item-${i + 1}) ⭐️ ${score}/10`
    })
    const toc = `${tocEntries.join('\n')}\n\n---\n\n`

    const parts = items.map((item, i) => this.formatItem(item, labels, language, i + 1))
    return header + toc + parts.join('')
  }

  private formatItem(
    item: ContentItem,
    labels: Labels,
    language: 'en' | 'zh',
    index: number,
  ): string {
    const title = sanitizeTitle(getLocalizedTitle(item, language))
    const url = item.url
    const score = item.aiScore ?? '?'
    const meta = item.metadata
    const isZh = language === 'zh'

    const summary = getLocalizedField(meta, 'detailedSummary', language) ?? item.aiSummary ?? ''
    const background = getLocalizedField(meta, 'background', language) ?? ''
    const discussion = getLocalizedField(meta, 'communityDiscussion', language) ?? ''

    const displayTitle = isZh ? pangu(title) : title
    const displaySummary = isZh ? pangu(summary) : summary
    const displayBackground = isZh ? pangu(background) : background
    const displayDiscussion = isZh ? pangu(discussion) : discussion

    // Source line: type · subreddit/feed/author · date · discussion link
    const sourceParts: string[] = [item.sourceType]
    if (typeof meta.subreddit === 'string') sourceParts.push(`r/${meta.subreddit}`)
    else if (typeof meta.feedName === 'string') sourceParts.push(meta.feedName)
    else sourceParts.push(item.author ?? 'unknown')

    const publishedDate = new Date(item.publishedAt)
    const dateStr = publishedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    sourceParts.push(dateStr)

    const discussionUrl = typeof meta.discussionUrl === 'string' ? meta.discussionUrl : null
    const sourceLine =
      sourceParts.join(' · ') + (discussionUrl ? ` · [Discussion](${discussionUrl})` : '')

    // References — collapsible details (matches original markup)
    const sources = Array.isArray(meta.sources)
      ? (meta.sources as Array<{ url?: string; title?: string } | string>)
      : []
    const referencesBlock = sources.length
      ? `<details><summary>${labels.references}</summary>\n<ul>\n${sources
          .map((s) => {
            const href = typeof s === 'string' ? s : (s.url ?? '')
            const t = typeof s === 'string' ? s : (s.title ?? href)
            return `  <li><a href="${href}">${sanitizeTitle(t)}</a></li>`
          })
          .join('\n')}\n</ul>\n</details>\n\n`
      : ''

    // Discussion — omit entirely if empty (fixes original flaw of printing empty placeholder)
    const discussionBlock = displayDiscussion.trim()
      ? `**${labels.discussion}**: ${displayDiscussion.trim()}\n\n`
      : ''

    const backgroundBlock = displayBackground.trim()
      ? `**${labels.background}**: ${displayBackground.trim()}\n\n`
      : ''

    const tagsBlock = item.aiTags.length
      ? `**${labels.tags}**: ${item.aiTags.map((t) => `\`#${t}\``).join(', ')}\n\n`
      : ''

    // [[item:N]] marker becomes id="item-N" on the h2 in renderDigestMarkdown
    // (avoids raw empty <a id> tags ever showing as text if HTML render fails)
    return `[[item:${index}]]\n\n## [${displayTitle}](${url}) ⭐️ ${score}/10\n\n${displaySummary}\n\n${sourceLine}\n\n${backgroundBlock}${referencesBlock}${discussionBlock}${tagsBlock}---\n\n`
  }

  private generateEmptySummary(date: string, totalFetched: number, labels: Labels): string {
    return `# ${labels.header} - ${date}\n\n> Analyzed ${totalFetched} items, but ${labels.empty}\n\n${labels.emptyBody}\n`
  }
}

function sanitizeTitle(title: string): string {
  // Replace [ ] with ( ) to avoid breaking markdown link syntax
  return title.replace(/\[/g, '(').replace(/\]/g, ')')
}

function getLocalizedTitle(item: ContentItem, lang: 'en' | 'zh'): string {
  const meta = item.metadata
  const key = `title_${lang}`
  if (typeof meta[key] === 'string' && meta[key]) return meta[key] as string
  return item.title
}

function getLocalizedField(
  meta: Record<string, unknown>,
  base: string,
  lang: 'en' | 'zh',
): string | null {
  const localized = meta[`${base}_${lang}`]
  if (typeof localized === 'string' && localized) return localized
  const generic = meta[base]
  if (typeof generic === 'string' && generic) return generic
  return null
}
