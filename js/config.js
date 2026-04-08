// WorldOfAI Tech - API Configuration
// Replace these values with your actual API keys
// Then add to GitHub repository secrets for production
//
// SECURITY NOTE: This is a static site, so API keys are visible in the browser.
// For production, consider using a serverless proxy (Cloudflare Workers, Netlify Functions)
// to keep your API keys server-side.

const CONFIG = {
  // NewsAPI.org - Get free key at https://newsapi.org
  // Note: NewsAPI has CORS restrictions for browser requests.
  // Register your domain (1yuub.github.io) at newsapi.org for production use.
  NEWSAPI_KEY: '',

  // CryptoPanic - Get free key at https://cryptopanic.com/developers/api/
  CRYPTOPANIC_KEY: '',

  // CoinGecko - Free tier available at https://coingecko.com/en/api
  // Free tier has rate limits; optionally add your key for higher limits
  COINGECKO_KEY: '',

  // Site configuration
  SITE_NAME: 'WorldOfAI Tech',
  SITE_URL: 'https://1yuub.github.io/worlofai-tech/',

  // Google AdSense - Add your publisher ID here
  // Format: ca-pub-XXXXXXXXXXXXXXXX
  // See ADSENSE_GUIDE.md for setup instructions
  ADSENSE_PUBLISHER_ID: '',

  // News fetch settings
  PAGE_SIZE: 12,
  CACHE_TTL: 300000, // 5 minutes in milliseconds
};
