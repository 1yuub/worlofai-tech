import { Article, Category } from '@/types';

// ── NewsAPI.org ──────────────────────────────────────────────────────────────
export async function fetchNewsAPI(
  query: string,
  category: Category = 'tech',
  page = 1,
  pageSize = 10,
): Promise<Article[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const categoryMap: Record<Category, string> = {
    tech: 'technology',
    ai: 'technology',
    crypto: 'business',
    dev: 'technology',
    market: 'business',
    general: 'general',
  };

  const searchQuery =
    query ||
    {
      tech: 'technology',
      ai: 'artificial intelligence OR machine learning OR AI',
      crypto: 'cryptocurrency OR bitcoin OR ethereum',
      dev: 'programming OR software development',
      market: 'stock market OR crypto market',
      general: 'technology',
    }[category];

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('apiKey', apiKey);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'worlofai-tech/1.0' },
    });
    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
    const data = await res.json();

    return (data.articles || []).map(
      (a: {
        title?: string;
        description?: string;
        url?: string;
        urlToImage?: string;
        source?: { name?: string };
        publishedAt?: string;
        author?: string;
      }) => ({
        id: `newsapi-${Buffer.from(a.url || '').toString('base64').slice(0, 16)}`,
        title: a.title || 'Untitled',
        description: a.description || '',
        url: a.url || '#',
        imageUrl: a.urlToImage || undefined,
        source: 'newsapi',
        sourceName: a.source?.name || 'NewsAPI',
        category,
        publishedAt: a.publishedAt || new Date().toISOString(),
        author: a.author || undefined,
        readTime: Math.ceil((a.description?.split(' ').length || 50) / 200),
      }),
    );
  } catch (err) {
    console.error('[NewsAPI]', err);
    return [];
  }
}

// ── Dev.to API ───────────────────────────────────────────────────────────────
export async function fetchDevTo(
  tag = 'javascript',
  page = 1,
  perPage = 10,
): Promise<Article[]> {
  const tagMap: Record<string, string> = {
    tech: 'webdev',
    ai: 'ai',
    crypto: 'blockchain',
    dev: 'programming',
    market: 'career',
    general: 'discuss',
  };

  const resolvedTag = tagMap[tag] || tag;
  const url = `https://dev.to/api/articles?tag=${resolvedTag}&page=${page}&per_page=${perPage}&state=rising`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Dev.to error: ${res.status}`);
    const data = await res.json();

    return data.map(
      (a: {
        id?: number;
        title?: string;
        description?: string;
        canonical_url?: string;
        url?: string;
        cover_image?: string;
        social_image?: string;
        user?: { name?: string };
        published_at?: string;
        tag_list?: string[];
        reading_time_minutes?: number;
      }) => ({
        id: `devto-${a.id}`,
        title: a.title || 'Untitled',
        description: a.description || '',
        url: a.canonical_url || a.url || '#',
        imageUrl: a.cover_image || a.social_image || undefined,
        source: 'devto',
        sourceName: 'Dev.to',
        category: (tag as Category) || 'dev',
        publishedAt: a.published_at || new Date().toISOString(),
        author: a.user?.name || undefined,
        tags: a.tag_list || [],
        readTime: a.reading_time_minutes || 5,
      }),
    );
  } catch (err) {
    console.error('[Dev.to]', err);
    return [];
  }
}

// ── CryptoPanic API ──────────────────────────────────────────────────────────
export async function fetchCryptoPanic(
  filter = 'hot',
  page = 1,
): Promise<Article[]> {
  const apiKey = process.env.CRYPTOPANIC_KEY;

  const url = new URL('https://cryptopanic.com/api/v1/posts/');
  url.searchParams.set('filter', filter);
  url.searchParams.set('kind', 'news');
  url.searchParams.set('public', 'true');
  if (apiKey) url.searchParams.set('auth_token', apiKey);
  if (page > 1) url.searchParams.set('page', String(page));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`CryptoPanic error: ${res.status}`);
    const data = await res.json();

    return (data.results || []).map(
      (a: {
        id?: number;
        title?: string;
        url?: string;
        source?: { title?: string };
        published_at?: string;
        currencies?: { code?: string }[];
        metadata?: { image?: string; description?: string };
      }) => ({
        id: `cryptopanic-${a.id}`,
        title: a.title || 'Untitled',
        description: a.metadata?.description || '',
        url: a.url || '#',
        imageUrl: a.metadata?.image || undefined,
        source: 'cryptopanic',
        sourceName: a.source?.title || 'CryptoPanic',
        category: 'crypto' as Category,
        publishedAt: a.published_at || new Date().toISOString(),
        tags: a.currencies?.map((c) => c.code).filter(Boolean) as string[],
        readTime: 3,
      }),
    );
  } catch (err) {
    console.error('[CryptoPanic]', err);
    return [];
  }
}

// ── CoinGecko API ────────────────────────────────────────────────────────────
export async function fetchCoinGeckoNews(
  page = 1,
): Promise<Article[]> {
  const url = `https://api.coingecko.com/api/v3/news?page=${page}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { 'x-cg-demo-api-key': process.env.COINGECKO_KEY || '' },
    });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = await res.json();

    return (data.data || []).map(
      (a: {
        id?: string;
        title?: string;
        description?: string;
        url?: string;
        thumb_2x?: string;
        author?: { name?: string };
        updated_at?: number;
      }) => ({
        id: `coingecko-${a.id}`,
        title: a.title || 'Untitled',
        description: a.description || '',
        url: a.url || '#',
        imageUrl: a.thumb_2x || undefined,
        source: 'coingecko',
        sourceName: 'CoinGecko',
        category: 'market' as Category,
        publishedAt: a.updated_at
          ? new Date(a.updated_at * 1000).toISOString()
          : new Date().toISOString(),
        author: a.author?.name || undefined,
        readTime: 4,
      }),
    );
  } catch (err) {
    console.error('[CoinGecko]', err);
    return [];
  }
}

// ── Mock / Fallback data ─────────────────────────────────────────────────────
export function getMockArticles(category: Category, count = 6, page = 1): Article[] {
  const now = new Date();
  const offset = (page - 1) * count;
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${category}-p${page}-${i}`,
    title: mockTitles[category][(offset + i) % mockTitles[category].length],
    description:
      'Stay up-to-date with the latest news and insights from the world of technology, AI, and cryptocurrency.',
    url: '#',
    imageUrl: `https://picsum.photos/seed/${category}-p${page}-${i}/800/450`,
    source: 'worldofai',
    sourceName: 'WorldOfAI Tech',
    category,
    publishedAt: new Date(now.getTime() - (offset + i) * 3600000).toISOString(),
    readTime: 3 + i,
  }));
}

const mockTitles: Record<Category, string[]> = {
  tech: [
    'The Future of Quantum Computing in 2025',
    'Apple Unveils Revolutionary M4 Chip Architecture',
    'Microsoft Azure Expands AI Services Globally',
    'OpenAI Releases GPT-5 with Reasoning Capabilities',
    'Google DeepMind Breakthrough in Protein Folding',
    'Meta Launches Next-Gen AR Glasses Platform',
  ],
  ai: [
    'Large Language Models Reach Human-Level Reasoning',
    'AI-Powered Drug Discovery Accelerates Clinical Trials',
    'Autonomous AI Agents Transforming Enterprise Software',
    'Multimodal AI Models Reshape Content Creation',
    'AI Safety Researchers Publish Alignment Breakthrough',
    'Open-Source AI Models Challenge Commercial Alternatives',
  ],
  crypto: [
    'Bitcoin Surpasses All-Time High Amid Institutional Demand',
    'Ethereum Layer-2 Solutions Reduce Fees by 90%',
    'DeFi Protocol TVL Reaches Record $200 Billion',
    'Solana Ecosystem Expands with 500 New Projects',
    'Central Banks Accelerate CBDC Development',
    'NFT Market Rebounds with Utility-Focused Collections',
  ],
  dev: [
    'Rust Overtakes Python in Systems Programming Popularity',
    'Next.js 15 Ships with Partial Pre-rendering by Default',
    'Bun 2.0 Achieves Full Node.js Compatibility',
    'TypeScript 6.0 Introduces New Type-Level Features',
    'Deno Adds npm Package Support and Edge Runtime',
    'WebAssembly Component Model Hits Stable Release',
  ],
  market: [
    'S&P 500 Hits Record High on Tech Earnings Beat',
    'NVIDIA Market Cap Surpasses $3 Trillion',
    'Venture Capital Investment in AI Triples Year-over-Year',
    'Tech IPO Market Reopen After Two-Year Pause',
    'Crypto Market Cap Reclaims $3 Trillion Milestone',
    'Global Semiconductor Shortage Shows Signs of Easing',
  ],
  general: [
    'SpaceX Starship Achieves Full Orbit on Fifth Test Flight',
    'WHO Approves First mRNA Vaccine for Malaria',
    'Scientists Achieve Cold Fusion Milestone',
    'Global Internet Access Reaches 75% of World Population',
    '5G Networks Cover 50% of Urban Areas Worldwide',
    'Renewable Energy Surpasses Fossil Fuels in Electricity Generation',
  ],
};
