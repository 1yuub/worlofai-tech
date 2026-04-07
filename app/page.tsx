import { CategoryFilter } from '@/components/news/CategoryFilter';
import { NewsFeed } from '@/components/news/NewsFeed';
import { AdSenseBlock } from '@/components/ads/AdSenseBlock';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
          Your Daily{' '}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 bg-clip-text text-transparent">
            Tech &amp; AI Digest
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Aggregating the best tech, AI, crypto and developer stories from NewsAPI, Dev.to, CryptoPanic &amp; CoinGecko.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Category filters */}
          <div className="mb-6">
            <CategoryFilter />
          </div>
          <NewsFeed initialCategory="tech" />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-6">
          {/* ── SIDEBAR AD PLACEMENT ──────────────────────────────────────────
              AdSense: 300x600 Half-Page / Responsive vertical
              Slot: sidebar-vertical  |  Position: Right sidebar, sticky
          ────────────────────────────────────────────────────────────────── */}
          <div className="sticky top-24">
            <AdSenseBlock slot="sidebar-vertical" />
          </div>
        </aside>
      </div>
    </div>
  );
}
