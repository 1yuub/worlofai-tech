'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, ExternalLink, Share2, BookmarkPlus } from 'lucide-react';
import { Article } from '@/types';
import { formatDate, categoryColor, categoryLabel, sourceColor, sourceLabel, cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: article.title, url: article.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.url).then(() => alert('Link copied!'));
    }
  }

  function handleSave() {
    const saved = JSON.parse(localStorage.getItem('saved-articles') || '[]') as string[];
    if (!saved.includes(article.id)) {
      localStorage.setItem('saved-articles', JSON.stringify([...saved, article.id]));
    }
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-0.5',
        featured && 'md:flex-row',
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0',
          featured ? 'md:w-2/5 h-56 md:h-auto' : 'h-48',
        )}
      >
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 640px) 100vw, 33vw'}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
            📰
          </div>
        )}

        {/* Category badge */}
        <span
          className={cn(
            'absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            categoryColor(article.category),
          )}
        >
          {categoryLabel(article.category)}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Source + date */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              sourceColor(article.source),
            )}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {article.sourceName || sourceLabel(article.source)}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(article.publishedAt)}
          </time>
        </div>

        {/* Title */}
        <h2
          className={cn(
            'font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors leading-snug mb-2',
            featured ? 'text-xl sm:text-2xl' : 'text-base',
          )}
        >
          <Link href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </Link>
        </h2>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1 mb-3">
            {article.description}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock size={12} />
            <span>{article.readTime ?? 3} min read</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              aria-label="Save article"
              className="rounded-full p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <BookmarkPlus size={14} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share article"
              className="rounded-full p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <Share2 size={14} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read full article"
              className="rounded-full p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
