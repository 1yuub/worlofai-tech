'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, categoryColor, categoryLabel } from '@/lib/utils';
import { Category } from '@/types';

const CATEGORIES: { slug: Category; emoji: string }[] = [
  { slug: 'tech', emoji: '💻' },
  { slug: 'ai', emoji: '🤖' },
  { slug: 'crypto', emoji: '₿' },
  { slug: 'dev', emoji: '⌨️' },
  { slug: 'market', emoji: '📈' },
];

export function CategoryFilter() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={cn(
          'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
          pathname === '/'
            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        )}
      >
        🏠 All
      </Link>

      {CATEGORIES.map(({ slug, emoji }) => {
        const active = pathname === `/category/${slug}`;
        return (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              active
                ? cn('bg-blue-500 text-white shadow-md shadow-blue-500/20')
                : cn(
                    categoryColor(slug),
                    'hover:opacity-80',
                  ),
            )}
          >
            {emoji} {categoryLabel(slug)}
          </Link>
        );
      })}
    </div>
  );
}
