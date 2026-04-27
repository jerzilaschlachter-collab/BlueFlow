import { NextResponse } from 'next/server'
import { fetchNewsHeadlines } from '@/lib/news'

export const runtime = 'nodejs'
export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const headlines = await fetchNewsHeadlines()
    return NextResponse.json({ headlines }, { status: 200 })
  } catch (err) {
    console.error('News fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
