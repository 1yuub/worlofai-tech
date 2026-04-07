'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article } from '@/types';
import { ArticleCard } from '@/components/news/ArticleCard';
import { AdSenseBlock } from '@/components/ads/AdSenseBlock';
import { Loader2, Search } from 'lucide-react';

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Search size={24} className="text-blue-500" />
          {q ? `Results for "${q}"` : 'Search'}
        </h1>
        {!loading && q && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {articles.length} article{articles.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── SEARCH AD PLACEMENT ────────────────────────────────────────────
          AdSense: 728x90 Leaderboard  |  top-horizontal slot
      ────────────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <AdSenseBlock slot="top-horizontal" />
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {!loading && articles.length === 0 && q && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No articles found for &quot;{q}&quot;. Try a different search term.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
