import Parser from 'rss-parser'

const parser = new Parser({ timeout: 8000 })

export interface NewsHeadline {
  title: string
  link: string
  pubDate: string
  source: string
  summary?: string
}

const NEWS_FEEDS: { url: string; source: string }[] = [
  { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^DJI,^IXIC&region=US&lang=en-US', source: 'Yahoo Finance' },
  { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com' },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch' },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', source: 'WSJ Markets' },
  { url: 'https://www.cnbc.com/id/15839121/device/rss/rss.html', source: 'CNBC' },
]

export async function fetchNewsHeadlines(): Promise<NewsHeadline[]> {
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async ({ url, source }) => {
      const rss = await parser.parseURL(url)
      return rss.items.slice(0, 15).map((item) => ({
        title: item.title ?? '',
        link: item.link ?? '',
        pubDate: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
        source,
        summary: item.contentSnippet ?? item.content ?? undefined,
      }))
    })
  )

  const allHeadlines: NewsHeadline[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allHeadlines.push(...result.value)
    }
  }

  allHeadlines.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  return allHeadlines.filter((h) => h.title && h.link)
}
