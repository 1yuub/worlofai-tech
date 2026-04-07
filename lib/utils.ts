import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

export function categoryLabel(slug: string): string {
  const labels: Record<string, string> = {
    tech: 'Tech News',
    ai: 'AI News',
    crypto: 'Crypto News',
    dev: 'Developer News',
    market: 'Market Updates',
    general: 'General',
  };
  return labels[slug] ?? slug;
}

export function categoryColor(slug: string): string {
  const colors: Record<string, string> = {
    tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ai: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dev: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    market: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    colors[slug] ??
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  );
}

export function sourceColor(source: string): string {
  const colors: Record<string, string> = {
    newsapi: 'bg-blue-500',
    devto: 'bg-indigo-500',
    cryptopanic: 'bg-orange-500',
    coingecko: 'bg-green-500',
    worldofai: 'bg-purple-500',
  };
  return colors[source] ?? 'bg-gray-500';
}

export function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    newsapi: 'NewsAPI',
    devto: 'Dev.to',
    cryptopanic: 'CryptoPanic',
    coingecko: 'CoinGecko',
    worldofai: 'WorldOfAI',
  };
  return labels[source] ?? source;
}
