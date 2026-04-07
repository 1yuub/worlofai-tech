'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Article, Category } from '@/types';
import { ArticleCard } from '@/components/news/ArticleCard';
import { AdSenseBlock } from '@/components/ads/AdSenseBlock';
import { Loader2, RefreshCw } from 'lucide-react';

interface NewsFeedProps {
  initialCategory?: Category;
}

export function NewsFeed({ initialCategory = 'tech' }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchArticles = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/news?category=${initialCategory}&page=${pageNum}&pageSize=12`,
        );
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data: { articles: Article[]; hasMore: boolean } = await res.json();
        setArticles((prev) => (reset ? data.articles : [...prev, ...data.articles]));
        setHasMore(data.hasMore);
      } catch (err) {
        setError('Unable to load articles. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [initialCategory],
  );

  // Initial load & category change
  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [initialCategory, fetchArticles]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            fetchArticles(next);
            return next;
          });
        }
      },
      { threshold: 0.1 },
    );
    observerRef.current.observe(sentinel);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, fetchArticles]);

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-gray-500 dark:text-gray-400">
        <p>{error}</p>
        <button
          onClick={() => fetchArticles(1, true)}
          className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── TOP AD PLACEMENT ─────────────────────────────────────────────────
          AdSense: 728x90 Leaderboard / Responsive horizontal
          Slot: top-horizontal  |  Position: Above fold, after hero
      ──────────────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <AdSenseBlock slot="top-horizontal" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <div
            key={article.id}
            className={idx % 7 === 0 && idx !== 0 ? 'sm:col-span-2 lg:col-span-3' : ''}
          >
            <ArticleCard
              article={article}
              featured={idx % 7 === 0 && idx !== 0}
            />
          </div>
        ))}

        {/* ── MID-FEED AD PLACEMENT ──────────────────────────────────────────
            AdSense: 300x250 Medium Rectangle / Responsive
            Slot: middle-horizontal  |  Position: Between articles (after 6th)
        ────────────────────────────────────────────────────────────────── */}
        {articles.length >= 6 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <AdSenseBlock slot="middle-horizontal" className="mx-auto max-w-lg" />
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
          You&#39;ve reached the end — check back later for more!
        </p>
      )}

      {/* ── BOTTOM AD PLACEMENT ───────────────────────────────────────────────
          AdSense: 728x90 Leaderboard / Responsive horizontal
          Slot: bottom-horizontal  |  Position: Below article list
      ──────────────────────────────────────────────────────────────────── */}
      <div className="mt-8">
        <AdSenseBlock slot="bottom-horizontal" />
      </div>
    </div>
  );
}
