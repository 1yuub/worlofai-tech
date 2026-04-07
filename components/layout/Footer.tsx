import Link from 'next/link';
import { Zap, Globe, Code2, Rss } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap size={14} className="text-white" />
              </div>
              WorldOfAI.tech
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your daily source for tech, AI, crypto, and developer news — all in one place.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Social" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Globe size={18} />
              </a>
              <a href="https://github.com/1yuub/worlofai-tech" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Code2 size={18} />
              </a>
              <a href="/api/rss" aria-label="RSS Feed" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Rss size={18} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[['/', 'Home'], ['/category/tech', 'Tech News'], ['/category/ai', 'AI News'], ['/category/crypto', 'Crypto'], ['/category/dev', 'Dev News'], ['/category/market', 'Markets']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-blue-500 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data sources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Data Sources</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {['NewsAPI.org', 'Dev.to', 'CryptoPanic', 'CoinGecko'].map((src) => (
                <li key={src}>{src}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} WorldOfAI.tech — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
