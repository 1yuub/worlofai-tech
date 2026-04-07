import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import { fetchNewsAPI, fetchDevTo } from '@/lib/newsProviders';
import { Article } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ articles: [], hasMore: false });
  }

  const cacheKey = `search-${q.toLowerCase()}`;
  const cached = getCache<{ articles: Article[] }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true });
  }

  const [newsApi, devTo] = await Promise.allSettled([
    fetchNewsAPI(q, 'general', 1, 10),
    fetchDevTo(q, 1, 5),
  ]);

  const articles: Article[] = [];
  if (newsApi.status === 'fulfilled') articles.push(...newsApi.value);
  if (devTo.status === 'fulfilled') articles.push(...devTo.value);

  const result = { articles, hasMore: false };
  setCache(cacheKey, result, 120);

  return NextResponse.json(result);
}
