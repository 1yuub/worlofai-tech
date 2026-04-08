# WorldOfAI Tech — AI, Tech & Crypto News Aggregator

[![Deploy to GitHub Pages](https://github.com/1yuub/worlofai-tech/actions/workflows/deploy.yml/badge.svg)](https://github.com/1yuub/worlofai-tech/actions/workflows/deploy.yml)

🌐 **Live at:** [https://1yuub.github.io/worlofai-tech/](https://1yuub.github.io/worlofai-tech/)

A professional, fully-functional news aggregation website that runs **directly on GitHub Pages** — no server, no build step, no localhost required. Built with pure HTML5, CSS3, and JavaScript.

## ✨ Features

- **Multi-API Integration** — Hacker News (Algolia), Dev.to, CryptoPanic, CoinGecko, NewsAPI.org
- **6 Content Categories** — Home, Tech, AI, Crypto, Dev, Markets, **Hacker News**
- **Works without API keys** — rich mock data fallback + Hacker News (keyless) always works
- **Progressive rendering** — articles appear as each source responds (no waiting for all)
- **Smart caching** — memory + localStorage TTL cache with stale-while-revalidate
- **Debounced search** — auto-searches after 400 ms of inactivity
- **Request coalescing** — duplicate API calls for the same data are merged automatically
- **Dark / Light theme** toggle with `localStorage` persistence
- **Infinite scroll** news feed with lazy-loaded images
- **Full-text search** across all sources
- **Save articles** to `localStorage` bookmarks
- **Share articles** via Web Share API + clipboard fallback
- **Breaking news ticker** with live headlines
- **AdSense-ready** — strategic placeholder slots with marked insertion points
- **SEO optimised** — Open Graph, Twitter Cards, sitemap, robots.txt
- **Responsive** — mobile-first design, works on all devices
- **Auto-deploys** to GitHub Pages on every push to `main`

## 🚀 Getting Started (GitHub Pages)

**The site is live immediately after pushing to `main`.** No setup required.

1. **Fork or clone** this repository
2. Go to **Settings → Pages** → set source to **GitHub Actions**
3. Push to `main` — GitHub Actions deploys automatically
4. Visit: `https://YOUR_USERNAME.github.io/worlofai-tech/`

The site works out-of-the-box with built-in sample articles. Add API keys below for live news data.

## 🔑 API Keys

Add API keys to `js/config.js` to enable live news data:

| Key | Source | Notes |
|---|---|---|
| *(none required)* | **Hacker News (Algolia)** | Free, keyless, CORS-enabled, ~50–150 ms |
| *(none required)* | **Dev.to** | Free open API, CORS-enabled, ~200–500 ms |
| `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) | Free tier: 100 req/day; register domain for browser use |
| `CRYPTOPANIC_KEY` | [cryptopanic.com](https://cryptopanic.com/developers/api/) | Optional; improves crypto news |
| `COINGECKO_KEY` | [coingecko.com](https://www.coingecko.com/en/api) | Optional; free tier: 30 req/min |

All keys are optional — the site falls back to Hacker News + Dev.to + built-in sample articles.

## ⚡ Performance & Caching Strategy

### Architecture

The site uses a three-layer speed strategy:

1. **Instant (0 ms)** — Skeleton loaders appear immediately on page load.
2. **Fast (0–100 ms)** — If cached data exists (memory or localStorage), it renders immediately while a background refresh runs (*stale-while-revalidate*).
3. **Progressive (~200–2000 ms)** — Each API provider fires in parallel; articles are rendered as each source responds, not waiting for the slowest one.

### `fetchWithCache()` Utility (`js/cache.js`)

All API calls go through `Cache.fetchWithCache(key, fetchFn, opts)`:

| Feature | Detail |
|---|---|
| **Memory cache** | In-process `Map`, sub-millisecond lookup |
| **localStorage cache** | Survives page refresh; TTL stored alongside data |
| **TTL** | Default 5 min (configurable via `CONFIG.CACHE_TTL`) |
| **Stale-while-revalidate** | Stale data (up to 3× TTL) shown instantly; background refresh runs |
| **Request coalescing** | Duplicate in-flight requests for the same key share one fetch |
| **Timeout** | Each request aborted after 8 s (configurable); HN uses 6 s |
| **Retry** | Exponential backoff: 1 extra attempt by default (500 ms delay) |

### API Speed Reference

| Provider | Auth | Typical latency | Rate limit |
|---|---|---|---|
| **Hacker News (Algolia)** | None | 50–150 ms | Generous (no published limit) |
| **Dev.to** | None | 200–500 ms | ~3 req/s free |
| **CoinGecko** | Optional | 300–800 ms | 30 req/min (free tier) |
| **CryptoPanic** | Required | 300–700 ms | ~100 req/day free |
| **NewsAPI** | Required | 500–1500 ms | 100 req/day (dev tier) |

### Perceived Performance Tricks

- **Skeleton cards** shown immediately (no blank page).
- **`content-visibility: auto`** on article cards — browser skips rendering off-screen cards.
- **`loading="lazy"`** on all images — browser doesn't load off-screen images.
- **`aspect-ratio: 16/9`** on image wrappers — prevents layout shift (CLS).
- **Preconnect + DNS-prefetch** in `<head>` for all API domains.
- **Debounced search** — fires after 400 ms of inactivity to avoid wasted requests.
- **Request coalescing** — switching tabs quickly won't fire duplicate fetches.

## ➕ Adding New Providers

1. Add a fetch function in `js/api.js` following the existing pattern.  
   Use `Cache.fetchWithCache(key, async (signal) => { ... })` for automatic caching/retry.
2. Normalize the response to the standard article schema:

```js
{
  id: 'prefix_uniqueId',
  title: 'Article title',
  description: 'Short summary',
  url: 'https://...',
  image: 'https://... (800×450)',
  source: 'Source Name',
  sourceColor: '#hexcolor',
  author: 'Author Name',
  publishedAt: '2025-01-01T00:00:00Z',
  readTime: '5 min read',
  category: 'tech',
  tags: ['tag1', 'tag2'],
}
```

3. Register your provider in `getProviders(category, page, pageSize)` for the relevant categories.
4. (Optional) Add a new category entry to the `CATEGORIES` array in `js/app.js`.

## 💰 AdSense Integration

See **[ADSENSE_GUIDE.md](./ADSENSE_GUIDE.md)** for full setup instructions.

**Quick setup:**
1. Sign up at [adsense.google.com](https://adsense.google.com) and add your site
2. After approval, uncomment the AdSense `<script>` tag in `index.html` `<head>`
3. Replace the `.ad-slot` `<div>` elements with your actual AdSense ad unit codes

**Pre-placed ad slots:**

| Slot | Format | Location |
|---|---|---|
| `ad-banner` | 728×90 | Top of page (leaderboard) |
| `ad-sidebar` | 300×250 | Right sidebar (sticky, desktop) |
| `ad-infeed` | 300×250 | Between articles (every 6 articles) |
| `ad-mobile-sticky` | 320×50 | Mobile sticky bottom |

All slots are marked with `<!-- ADSENSE: ... -->` HTML comments in `index.html` and `js/app.js`.

## 🗂 Project Structure

```
worlofai-tech/
├── index.html              # Homepage + all category views
├── css/
│   └── style.css           # Dark/light themes, responsive grid, perf CSS
├── js/
│   ├── config.js           # API keys & site configuration
│   ├── cache.js            # fetchWithCache() utility (caching, retry, coalescing)
│   ├── api.js              # HN Algolia, Dev.to, CryptoPanic, CoinGecko, NewsAPI + mock data
│   └── app.js              # Theme, routing, progressive rendering, search, save, share
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions: auto-deploy to GitHub Pages
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── .nojekyll               # Required for GitHub Pages to serve all files
└── ADSENSE_GUIDE.md        # AdSense setup instructions
```

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Hosting | GitHub Pages (free) |
| CI/CD | GitHub Actions |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES2020+) |
| APIs | Hacker News (Algolia), Dev.to, CryptoPanic, CoinGecko, NewsAPI.org |
| Caching | Memory Map + localStorage with TTL & stale-while-revalidate |
| Theme | CSS custom properties (dark/light) |
| Storage | `localStorage` (theme, saved articles, API response cache) |
| Fonts | Inter (Google Fonts) |

## 📄 License

MIT
