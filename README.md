# WorldOfAI Tech — AI, Tech & Crypto News Aggregator

[![Deploy to GitHub Pages](https://github.com/1yuub/worlofai-tech/actions/workflows/deploy.yml/badge.svg)](https://github.com/1yuub/worlofai-tech/actions/workflows/deploy.yml)

🌐 **Live at:** [https://1yuub.github.io/worlofai-tech/](https://1yuub.github.io/worlofai-tech/)

A professional, fully-functional news aggregation website that runs **directly on GitHub Pages** — no server, no build step, no localhost required. Built with pure HTML5, CSS3, and JavaScript.

## ✨ Features

- **Multi-API Integration** — Dev.to, CryptoPanic, CoinGecko, NewsAPI.org
- **5 Content Categories** — Tech, AI, Crypto, Dev, Markets
- **Works without API keys** — rich mock data fallback included
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
| `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) | Free tier: 100 req/day; register domain for browser use |
| `CRYPTOPANIC_KEY` | [cryptopanic.com](https://cryptopanic.com/developers/api/) | Optional; improves crypto news |
| `COINGECKO_KEY` | [coingecko.com](https://www.coingecko.com/en/api) | Optional; free tier: 30 req/min |

**Dev.to** works without any key (open API, CORS-enabled).  
All other keys are optional — the site falls back to built-in sample articles.

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
│   └── style.css           # Dark/light themes, responsive grid
├── js/
│   ├── config.js           # API keys & site configuration
│   ├── api.js              # Dev.to, CryptoPanic, CoinGecko, NewsAPI + mock data
│   └── app.js              # Theme, routing, infinite scroll, search, save, share
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
| APIs | Dev.to, CryptoPanic, CoinGecko, NewsAPI.org |
| Theme | CSS custom properties (dark/light) |
| Storage | `localStorage` (theme + saved articles) |
| Fonts | Inter (Google Fonts) |

## 📄 License

MIT
