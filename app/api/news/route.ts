import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import {
  fetchNewsAPI,
  fetchDevTo,
  fetchCryptoPanic,
  fetchCoinGeckoNews,
  getMockArticles,
} from '@/lib/newsProviders';
import { Article, Category } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') as Category) || 'tech';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(
    50,
    parseInt(searchParams.get('pageSize') || String(PAGE_SIZE), 10),
  );

  const cacheKey = `news-${category}-${page}-${pageSize}`;
  const cached = getCache<{ articles: Article[]; hasMore: boolean }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true });
  }

  let articles: Article[] = [];

  try {
    if (category === 'crypto') {
      const [cryptoPanic, coinGecko] = await Promise.allSettled([
        fetchCryptoPanic('hot', page),
        fetchCoinGeckoNews(page),
      ]);
      if (cryptoPanic.status === 'fulfilled') articles.push(...cryptoPanic.value);
      if (coinGecko.status === 'fulfilled') articles.push(...coinGecko.value);
    } else if (category === 'market') {
      const [coinGecko, newsApi] = await Promise.allSettled([
        fetchCoinGeckoNews(page),
        fetchNewsAPI('', 'market', page, Math.ceil(pageSize / 2)),
      ]);
      if (coinGecko.status === 'fulfilled') articles.push(...coinGecko.value);
      if (newsApi.status === 'fulfilled') articles.push(...newsApi.value);
    } else if (category === 'dev') {
      const devArticles = await fetchDevTo('dev', page, pageSize);
      articles.push(...devArticles);
    } else {
      // tech, ai, general
      const [newsApi, devTo] = await Promise.allSettled([
        fetchNewsAPI('', category, page, Math.ceil(pageSize * 0.7)),
        fetchDevTo(category, page, Math.ceil(pageSize * 0.3)),
      ]);
      if (newsApi.status === 'fulfilled') articles.push(...newsApi.value);
      if (devTo.status === 'fulfilled') articles.push(...devTo.value);
    }
  } catch (err) {
    console.error('[/api/news] Error:', err);
  }

  // Fall back to mock data if no real articles
  if (articles.length === 0) {
    articles = getMockArticles(category, pageSize, page);
  }

  // Sort by date, de-duplicate
  const seen = new Set<string>();
  const unique = articles
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, pageSize);

  const result = { articles: unique, hasMore: articles.length >= pageSize };
  setCache(cacheKey, result, 300); // 5-minute cache

  return NextResponse.json(result);
}
