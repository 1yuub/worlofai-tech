# WorldOfAI.tech — News Aggregation Website

A professional, full-featured news aggregation website built with **Next.js 16**, **Tailwind CSS**, and multiple news APIs. Aggregates tech, AI, crypto, and developer news into one beautiful, AdSense-ready site.

## ✨ Features

- **Multi-API Integration** — NewsAPI.org, Dev.to, CryptoPanic, CoinGecko
- **5 Content Categories** — Tech, AI, Crypto, Dev, Market
- **Dark / Light theme** toggle with system preference detection
- **Infinite scroll** feed
- **Full-text search** across all sources
- **AdSense-ready** — placeholder components with clearly marked insertion points
- **SEO optimised** — Open Graph, Twitter cards, sitemap-ready
- **Responsive** — mobile-first, works on all devices
- **Fast** — in-memory API caching (5-min TTL), Next.js ISR

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/1yuub/worlofai-tech
cd worlofai-tech

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your API keys

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔑 API Keys

| Variable | Source | Notes |
|---|---|---|
| `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) | Free tier: 100 req/day |
| `CRYPTOPANIC_KEY` | [cryptopanic.com](https://cryptopanic.com/developers/api/) | Free tier available |
| `COINGECKO_KEY` | [coingecko.com](https://www.coingecko.com/en/api) | Free tier: 30 req/min |

All keys are optional — the site falls back to sample data when keys are missing.

## 📍 AdSense Integration

See **[ADSENSE_GUIDE.md](./ADSENSE_GUIDE.md)** for full setup instructions.

**Quick setup:**
1. Add `NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-YOUR_ID` to `.env.local`
2. Update slot IDs in `components/ads/AdSenseBlock.tsx`
3. Uncomment the AdSense `<script>` tag in `app/layout.tsx`

**Ad placements:**
| Slot | Format | Location |
|---|---|---|
| `top-horizontal` | 728×90 | Above article feed |
| `middle-horizontal` | 300×250 | Between articles (every 6) |
| `bottom-horizontal` | 728×90 | Below article feed |
| `sidebar-vertical` | 300×600 | Right sidebar (desktop) |

## 🗂 Project Structure

```
worlofai-tech/
├── app/
│   ├── api/
│   │   ├── news/route.ts       # Aggregated news endpoint
│   │   └── search/route.ts     # Search endpoint
│   ├── category/[slug]/page.tsx
│   ├── search/page.tsx
│   ├── layout.tsx              # Root layout + AdSense script location
│   └── page.tsx                # Homepage
├── components/
│   ├── ads/
│   │   └── AdSenseBlock.tsx    # AdSense component with slot mapping
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── news/
│   │   ├── ArticleCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── NewsFeed.tsx        # Infinite scroll feed
│   └── ui/
│       ├── SearchBar.tsx
│       ├── ThemeProvider.tsx
│       ├── ThemeToggle.tsx
│       └── TickerBanner.tsx
├── lib/
│   ├── cache.ts                # In-memory API cache
│   ├── newsProviders.ts        # NewsAPI, Dev.to, CryptoPanic, CoinGecko
│   └── utils.ts
├── types/
│   └── index.ts
├── .env.example
├── ADSENSE_GUIDE.md
└── next.config.ts
```

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Icons | Lucide React |
| Date Handling | date-fns |
| HTTP | Native fetch with Next.js caching |

## 🚢 Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in the Vercel dashboard.

### Self-hosted

```bash
npm run build
npm start
```

## 📄 License

MIT
