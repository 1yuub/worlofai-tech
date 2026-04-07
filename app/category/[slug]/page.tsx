import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NewsFeed } from '@/components/news/NewsFeed';
import { CategoryFilter } from '@/components/news/CategoryFilter';
import { AdSenseBlock } from '@/components/ads/AdSenseBlock';
import { categoryLabel } from '@/lib/utils';
import { Category } from '@/types';

const VALID_CATEGORIES: Category[] = ['tech', 'ai', 'crypto', 'dev', 'market', 'general'];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = categoryLabel(slug);
  return {
    title: `${label} — WorldOfAI.tech`,
    description: `Latest ${label} stories aggregated from top sources.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  if (!VALID_CATEGORIES.includes(slug as Category)) {
    notFound();
  }

  const category = slug as Category;
  const label = categoryLabel(category);

  const categoryEmojis: Record<Category, string> = {
    tech: '💻',
    ai: '🤖',
    crypto: '₿',
    dev: '⌨️',
    market: '📈',
    general: '🌐',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {categoryEmojis[category]} {label}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          The freshest {label.toLowerCase()} stories, updated continuously.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <CategoryFilter />
          </div>
          <NewsFeed initialCategory={category} />
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-6">
          {/* ── SIDEBAR AD PLACEMENT ──────────────────────────────────────────
              AdSense: 300x600 Half-Page / Responsive vertical
              Slot: sidebar-vertical  |  Position: Right sidebar
          ────────────────────────────────────────────────────────────────── */}
          <div className="sticky top-24">
            <AdSenseBlock slot="sidebar-vertical" />
          </div>
        </aside>
      </div>
    </div>
  );
}
