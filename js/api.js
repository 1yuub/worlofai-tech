// WorldOfAI Tech - API Integration Module
// Uses Cache.fetchWithCache() for TTL caching, stale-while-revalidate, timeout & retry.

const API = (() => {

  // ─── Helpers ──────────────────────────────────────────────────────────────
  // Strip HTML tags using DOM when available, or a whitelist-based regex fallback.
  // Using DOM textContent is the most reliable approach and avoids regex bypass issues.
  function _stripHtml(html) {
    if (typeof document !== 'undefined') {
      const el = document.createElement('div');
      el.innerHTML = html;
      return el.textContent || el.innerText || '';
    }
    // Fallback: replace all tags (including those with nested < characters)
    return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ');
  }

  // ─── Dev.to ───────────────────────────────────────────────────────────────
  async function fetchDevTo(tag = 'webdev', page = 1, perPage = 12) {
    const key = `devto_${tag}_${page}_${perPage}`;
    return Cache.fetchWithCache(key, async (signal) => {
      const url = `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&page=${page}&per_page=${perPage}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`Dev.to ${res.status}`);
      const data = await res.json();
      return data.map(a => ({
        id: `devto_${a.id}`,
        title: a.title,
        description: a.description || a.tag_list?.join(', ') || '',
        url: a.url,
        image: a.cover_image || a.social_image || `https://picsum.photos/seed/devto${a.id}/800/450`,
        source: 'Dev.to',
        sourceColor: '#3b49df',
        author: a.user?.name || 'Dev.to',
        publishedAt: a.published_at,
        readTime: a.reading_time_minutes ? `${a.reading_time_minutes} min read` : '5 min read',
        category: tag,
        tags: a.tag_list || [],
      }));
    }).catch(e => { console.warn('Dev.to fetch failed:', e.message); return []; });
  }

  // ─── CryptoPanic ─────────────────────────────────────────────────────────
  async function fetchCryptoPanic(filter = 'trending', page = 1) {
    if (!CONFIG.CRYPTOPANIC_KEY) return [];
    const key = `cryptopanic_${filter}_${page}`;
    return Cache.fetchWithCache(key, async (signal) => {
      const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${CONFIG.CRYPTOPANIC_KEY}&filter=${filter}&page=${page}&public=true`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`CryptoPanic ${res.status}`);
      const data = await res.json();
      return (data.results || []).map(a => ({
        id: `cp_${a.id}`,
        title: a.title,
        description: a.metadata?.description || 'Crypto news update.',
        url: a.url,
        image: a.metadata?.image || `https://picsum.photos/seed/cp${a.id}/800/450`,
        source: 'CryptoPanic',
        sourceColor: '#f59e0b',
        author: a.source?.title || 'CryptoPanic',
        publishedAt: a.created_at,
        readTime: '3 min read',
        category: 'crypto',
        tags: ['crypto', 'blockchain'],
      }));
    }).catch(e => { console.warn('CryptoPanic fetch failed:', e.message); return []; });
  }

  // ─── CoinGecko ────────────────────────────────────────────────────────────
  async function fetchCoinGeckoNews(page = 1) {
    const key = `coingecko_${page}`;
    return Cache.fetchWithCache(key, async (signal) => {
      const headers = CONFIG.COINGECKO_KEY ? { 'x-cg-demo-api-key': CONFIG.COINGECKO_KEY } : {};
      const res = await fetch(`https://api.coingecko.com/api/v3/news?page=${page}`, { signal, headers });
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data = await res.json();
      return (data.data || []).map(a => ({
        id: `cg_${a.id || Math.random()}`,
        title: a.title,
        description: a.description || 'Latest crypto market news.',
        url: a.url,
        image: a.thumb_2x || a.thumb || `https://picsum.photos/seed/cg${a.id}/800/450`,
        source: 'CoinGecko',
        sourceColor: '#10b981',
        author: a.author || 'CoinGecko',
        publishedAt: a.created_at ? new Date(a.created_at * 1000).toISOString() : new Date().toISOString(),
        readTime: '4 min read',
        category: 'crypto',
        tags: ['crypto', 'market'],
      }));
    }).catch(e => { console.warn('CoinGecko fetch failed:', e.message); return []; });
  }

  // ─── NewsAPI ──────────────────────────────────────────────────────────────
  async function fetchNewsAPI(query = 'technology', category = 'technology', page = 1, pageSize = 12) {
    if (!CONFIG.NEWSAPI_KEY) return [];
    const key = `newsapi_${query}_${category}_${page}`;
    return Cache.fetchWithCache(key, async (signal) => {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${CONFIG.NEWSAPI_KEY}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(data.message);
      return (data.articles || []).map((a, i) => ({
        id: `newsapi_${page}_${i}`,
        title: a.title,
        description: a.description || a.content?.slice(0, 150) || '',
        url: a.url,
        image: a.urlToImage || `https://picsum.photos/seed/na${i}/800/450`,
        source: a.source?.name || 'NewsAPI',
        sourceColor: '#6366f1',
        author: a.author || a.source?.name || 'NewsAPI',
        publishedAt: a.publishedAt,
        readTime: '5 min read',
        category: category,
        tags: [category],
      }));
    }).catch(e => { console.warn('NewsAPI fetch failed:', e.message); return []; });
  }

  // ─── Hacker News (Algolia) ────────────────────────────────────────────────
  // No API key required. Fast, CORS-enabled, free.
  async function fetchHackerNews(query = '', page = 1, perPage = 12) {
    const key = `hn_${query}_${page}_${perPage}`;
    return Cache.fetchWithCache(key, async (signal) => {
      const p = page - 1; // Algolia is 0-indexed
      const endpoint = query
        ? `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${perPage}&page=${p}`
        : `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=${perPage}&page=${p}`;
      const res = await fetch(endpoint, { signal });
      if (!res.ok) throw new Error(`HN Algolia ${res.status}`);
      const data = await res.json();
      return (data.hits || [])
        .filter(h => h.title && (h.url || h.objectID))
        .map(h => ({
          id: `hn_${h.objectID}`,
          title: h.title,
          description: h.story_text
            ? _stripHtml(h.story_text).slice(0, 200)
            : `${h.points || 0} points · ${h.num_comments || 0} comments on Hacker News`,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          image: `https://picsum.photos/seed/hn${h.objectID}/800/450`,
          source: 'Hacker News',
          sourceColor: '#ff6600',
          author: h.author || 'HN',
          publishedAt: h.created_at,
          readTime: `${Math.max(2, Math.ceil((h.num_comments || 5) / 15))} min read`,
          category: 'tech',
          tags: ['hackernews', ...(query ? [query.split(' ')[0].toLowerCase()] : ['tech'])],
          hnPoints: h.points || 0,
        }));
    }, { timeout: 6000, retries: 1 })
    .catch(e => { console.warn('HN Algolia fetch failed:', e.message); return []; });
  }

  // ─── Mock Data ────────────────────────────────────────────────────────────
  const MOCK = {
    ai: [
      { title: "GPT-5 Arrives With Unprecedented Reasoning Capabilities", desc: "OpenAI's latest model demonstrates human-level performance across math, coding, and complex analysis benchmarks in internal evaluations.", img: "ai1", tags: ["openai", "llm", "gpt"], author: "Sarah Chen" },
      { title: "Google DeepMind's Gemini Ultra 2 Crushes Coding Benchmarks", desc: "The new model achieves 95% on HumanEval and introduces a 2M token context window, enabling entire codebases to be processed at once.", img: "ai2", tags: ["google", "gemini", "deepmind"], author: "James Park" },
      { title: "Anthropic Raises $4B to Accelerate Claude Development", desc: "The AI safety company secures massive funding to expand its Constitutional AI research and deploy Claude across enterprise customers globally.", img: "ai3", tags: ["anthropic", "claude", "funding"], author: "Emily Watson" },
      { title: "AI Agents Are Now Writing Their Own Code — And Shipping It", desc: "Companies like Devin and SWE-agent are demonstrating autonomous software engineers that can independently complete full GitHub issues.", img: "ai4", tags: ["agents", "automation", "coding"], author: "Alex Rivera" },
      { title: "Meta's Llama 4 Goes Open Source With Multimodal Superpowers", desc: "Meta releases its most powerful open model yet, capable of understanding images, video, and audio alongside text with state-of-the-art results.", img: "ai5", tags: ["meta", "llama", "open-source"], author: "Priya Sharma" },
      { title: "Mistral AI Launches 'Le Chat' Enterprise with 32K Context", desc: "The French AI startup challenges OpenAI with a privacy-first enterprise assistant that runs on-premise and supports 100+ languages natively.", img: "ai6", tags: ["mistral", "enterprise", "europe"], author: "Louis Martin" },
      { title: "AI Model Can Now Predict Protein Structures in Milliseconds", desc: "Building on AlphaFold's success, the new ESMFold 3 model brings drug discovery timelines from years to days with near-perfect accuracy.", img: "ai7", tags: ["biotech", "alphafold", "healthcare"], author: "Dr. Raj Patel" },
      { title: "OpenAI Launches Real-Time Voice API for Developers", desc: "Developers can now build conversational AI apps with sub-300ms latency, natural interruption handling, and emotion detection built in.", img: "ai8", tags: ["openai", "voice", "api"], author: "Tech Reporter" },
      { title: "Sam Altman: AGI Could Arrive Within 4 Years", desc: "OpenAI CEO makes bold prediction at Davos, outlining a roadmap where superintelligent systems help solve climate change and disease by 2030.", img: "ai9", tags: ["agi", "openai", "future"], author: "Global Tech Wire" },
      { title: "AI-Powered Code Review Cuts Developer Bugs by 40%", desc: "A new study from MIT shows teams using AI-assisted code review ship 40% fewer production bugs and complete PRs 2x faster than manual review.", img: "ai10", tags: ["devtools", "productivity", "code-review"], author: "MIT Research" },
      { title: "Runway Gen-3 Produces Photorealistic Video from Text", desc: "The latest video generation model blurs the line between AI and reality, generating 30-second HD clips indistinguishable from real footage.", img: "ai11", tags: ["video", "generative-ai", "runway"], author: "Creative AI Lab" },
      { title: "China's Kimi AI Model Surpasses GPT-4 on Key Benchmarks", desc: "Moonshot AI's Kimi-k1.5 demonstrates superior long-context reasoning and mathematical problem-solving, intensifying the global AI race.", img: "ai12", tags: ["china", "kimi", "competition"], author: "Asia Tech Times" },
    ],
    crypto: [
      { title: "Bitcoin Surpasses $100K for the First Time in History", desc: "BTC breaks the psychological barrier amid spot ETF inflows, institutional adoption, and post-halving supply squeeze driving unprecedented demand.", img: "crypto1", tags: ["bitcoin", "btc", "price"], author: "Coin Reporter" },
      { title: "Ethereum ETF Approval Triggers $2B in First-Week Inflows", desc: "BlackRock and Fidelity's Ethereum products see record demand as institutional investors diversify beyond Bitcoin into smart contract platforms.", img: "crypto2", tags: ["ethereum", "etf", "institutional"], author: "ETF Watch" },
      { title: "Solana's DeFi TVL Hits All-Time High of $15 Billion", desc: "The high-performance blockchain sees explosive growth with new DEXs, lending protocols, and memecoins driving activity to unprecedented levels.", img: "crypto3", tags: ["solana", "defi", "tvl"], author: "DeFi Digest" },
      { title: "Coinbase Launches Layer-2 Chain 'Base' Goes Viral With Memes", desc: "Base network sees 2M+ daily transactions driven by viral meme coins, NFT drops, and DeFi apps as Coinbase's L2 becomes a cultural phenomenon.", img: "crypto4", tags: ["base", "coinbase", "layer2"], author: "L2 News" },
      { title: "BlackRock CEO: Crypto Is Legitimate Asset Class for Portfolios", desc: "Larry Fink's public endorsement of Bitcoin and digital assets signals a complete reversal from his 2017 stance and validates crypto for pension funds.", img: "crypto5", tags: ["blackrock", "institutional", "bitcoin"], author: "Finance Daily" },
      { title: "SEC Approves Spot Bitcoin ETF — What It Means for Markets", desc: "The landmark regulatory approval opens the floodgates for trillion-dollar pension funds, endowments, and retail investors to access Bitcoin.", img: "crypto6", tags: ["sec", "etf", "regulation"], author: "Regulatory Watch" },
      { title: "XRP Wins Partial Victory in SEC Lawsuit, Price Surges 60%", desc: "Judge rules XRP not a security in programmatic sales, sending the token soaring and setting a precedent that could reshape crypto regulation.", img: "crypto7", tags: ["xrp", "ripple", "sec"], author: "Legal Crypto" },
      { title: "Avalanche Secures $350M from Institutional Investors for Subnet Growth", desc: "Major banks and hedge funds back Avalanche's enterprise blockchain vision, with JPMorgan piloting tokenized assets on custom subnets.", img: "crypto8", tags: ["avalanche", "avax", "enterprise"], author: "Crypto VC Watch" },
      { title: "DeFi Protocol Uniswap V4 Launches with 'Hooks' — Revolutionizing DEXs", desc: "The new architecture allows custom logic in liquidity pools, enabling on-chain limit orders, dynamic fees, and MEV protection natively.", img: "crypto9", tags: ["uniswap", "defi", "amm"], author: "DeFi Builder" },
      { title: "NFT Market Rebounds: $500M in Sales Last Quarter", desc: "After the 2022-2023 bear market, NFTs make a comeback with AI-generated art, gaming assets, and brand-backed collections leading recovery.", img: "crypto10", tags: ["nft", "art", "market"], author: "NFT Insider" },
      { title: "Lightning Network Capacity Hits 6,000 BTC as Bitcoin Payments Surge", desc: "El Salvador's Bitcoin adoption drives Lightning usage, with major merchants now accepting BTC payments via the instant settlement layer.", img: "crypto11", tags: ["lightning", "payments", "bitcoin"], author: "Bitcoin Magazine" },
      { title: "Tether Launches USDT on Ton Blockchain, Eyes 900M Telegram Users", desc: "The stablecoin giant integrates with Telegram's blockchain, potentially giving nearly a billion users access to dollar-denominated digital assets.", img: "crypto12", tags: ["tether", "usdt", "ton"], author: "Stablecoin News" },
    ],
    tech: [
      { title: "Apple Vision Pro 2 Leaked: Lighter, Cheaper, More Powerful", desc: "Leaked CAD renders and supply chain reports reveal a thinner design, M4 chip, and a $2,499 starting price for Apple's second-generation spatial computer.", img: "tech1", tags: ["apple", "vision-pro", "ar"], author: "Mark Gurman" },
      { title: "NVIDIA Blackwell GPU Architecture: 30x Faster AI Inference", desc: "Jensen Huang unveils the GB200 NVL72 system at GTC, promising transformative speedups for large language model training and inference at scale.", img: "tech2", tags: ["nvidia", "gpu", "blackwell"], author: "Tom's Hardware" },
      { title: "Microsoft Copilot Gets Autonomous 'Agent' Mode for Windows", desc: "The new Copilot can now take actions on your PC — browsing, editing files, sending emails — without manual confirmation, sparking privacy debate.", img: "tech3", tags: ["microsoft", "copilot", "windows"], author: "The Verge" },
      { title: "Tesla's Full Self-Driving V12 Achieves Level 3 Autonomy in 30 States", desc: "Elon Musk announces regulatory approval for hands-free driving on highways across the US, a major milestone in the years-long FSD saga.", img: "tech4", tags: ["tesla", "fsd", "autonomous"], author: "Electrek" },
      { title: "Apple Intelligence Arrives: Here's What iPhone Can Do With AI Now", desc: "iOS 18.2 brings ChatGPT integration, priority notifications, AI image generation, and a completely redesigned Siri to over 2 billion Apple devices.", img: "tech5", tags: ["apple", "ios", "siri"], author: "9to5Mac" },
      { title: "Quantum Computer Solves 30-Year-Old Math Problem in 200 Seconds", desc: "IBM's 1,000-qubit Eagle processor demonstrates quantum advantage on a complex optimization problem that would take classical computers millennia.", img: "tech6", tags: ["quantum", "ibm", "computing"], author: "Science Daily" },
      { title: "Meta's AR Glasses Orion: The Most Advanced Wearable Ever Made", desc: "Meta unveils Orion, true AR glasses with holographic displays, a neural wristband controller, and all-day battery — but not yet for consumers.", img: "tech7", tags: ["meta", "ar", "glasses"], author: "Road to VR" },
      { title: "SpaceX Starship Completes First Orbital Flight, Catches Booster", desc: "The world's largest rocket successfully completes a full orbital test and the Super Heavy booster is caught mid-air by the Mechazilla arms.", img: "tech8", tags: ["spacex", "starship", "space"], author: "Ars Technica" },
      { title: "Intel Core Ultra 200 Series Brings Neural Processing to Every PC", desc: "Intel's latest laptop processors feature dedicated NPU silicon for AI acceleration, enabling local LLM inference and real-time translation offline.", img: "tech9", tags: ["intel", "cpu", "ai-pc"], author: "AnandTech" },
      { title: "Google's Willow Quantum Chip Breaks Computational Records", desc: "Google DeepMind's 105-qubit processor performs a benchmark calculation in 5 minutes that would take classical computers 10 septillion years.", img: "tech10", tags: ["google", "quantum", "willow"], author: "Google Blog" },
      { title: "Samsung Galaxy S25 Ultra: Titanium Design Meets Snapdragon 8 Elite", desc: "Samsung's flagship integrates native AI features, a thinner S Pen, and a 200MP camera system that captures stunning detail in any light.", img: "tech11", tags: ["samsung", "galaxy", "mobile"], author: "GSMArena" },
      { title: "Waymo Launches Fully Autonomous Robotaxi Service in Los Angeles", desc: "With no safety driver, Waymo One begins commercial rides in LA, marking a massive expansion of the world's only commercial driverless taxi fleet.", img: "tech12", tags: ["waymo", "autonomous", "robotaxi"], author: "TechCrunch" },
    ],
    dev: [
      { title: "TypeScript 5.5 Released: New Inferred Type Predicates Blow Minds", desc: "The latest TypeScript version auto-infers type guards from function bodies, eliminates dozens of common type assertions, and ships major perf wins.", img: "dev1", tags: ["typescript", "javascript", "release"], author: "TypeScript Team" },
      { title: "Next.js 15 Ships Turbopack by Default — Builds 10x Faster", desc: "Vercel's React framework makes Turbopack the default bundler, reducing cold start build times dramatically and shipping partial pre-rendering.", img: "dev2", tags: ["nextjs", "react", "vercel"], author: "Lee Robinson" },
      { title: "GitHub Copilot Workspace: AI Plans and Executes Entire Features", desc: "GitHub's new agentic coding environment lets developers describe a feature in natural language and watch Copilot write, test, and iterate autonomously.", img: "dev3", tags: ["github", "copilot", "ai"], author: "GitHub Blog" },
      { title: "Bun 1.1 Becomes the Fastest JavaScript Runtime, Beats Node by 4x", desc: "Bun's all-in-one runtime now passes 99% of Node.js compatibility tests, ships a native bundler, and executes scripts 4x faster than Node in benchmarks.", img: "dev4", tags: ["bun", "javascript", "runtime"], author: "Jarred Sumner" },
      { title: "React 19 Stable: Server Components, Actions, and New Hooks Land", desc: "The biggest React update in years ships server components to stable, introduces the `use` hook for async data, and adds document metadata management.", img: "dev5", tags: ["react", "javascript", "frontend"], author: "React Team" },
      { title: "Rust Overtakes Java in Developer Satisfaction for Third Year Running", desc: "Stack Overflow's 2025 survey reveals Rust remains the most loved language, while Python maintains its position as most wanted among newcomers.", img: "dev6", tags: ["rust", "java", "survey"], author: "Stack Overflow" },
      { title: "Svelte 5 Runes API: A Completely New Mental Model for Reactivity", desc: "Rich Harris introduces Runes — compiler-based reactive primitives that replace stores and make Svelte's reactivity work anywhere, not just .svelte files.", img: "dev7", tags: ["svelte", "frontend", "runes"], author: "Rich Harris" },
      { title: "Cloudflare Workers AI: Run LLMs at the Edge in 200+ Locations", desc: "Cloudflare brings GPU-accelerated AI inference to its global network, enabling sub-100ms LLM responses for users anywhere in the world.", img: "dev8", tags: ["cloudflare", "edge", "workers"], author: "Cloudflare Blog" },
      { title: "Wasm Garbage Collection Ships in All Major Browsers", desc: "WebAssembly GC support enables Java, Kotlin, Dart, and other GC-managed languages to run natively in browsers without huge runtime overhead.", img: "dev9", tags: ["wasm", "browsers", "performance"], author: "WebAssembly Team" },
      { title: "Astro 5.0 Content Layer API Redefines Static Site Performance", desc: "Astro's new architecture separates content fetching from rendering, enabling incremental builds and making 10,000-page sites build in under 10 seconds.", img: "dev10", tags: ["astro", "static", "performance"], author: "Astro Team" },
      { title: "Drizzle ORM Hits 1.0: TypeScript-First Database Toolkit Matures", desc: "The lightweight SQL-focused ORM reaches stable, offering superior type inference, migrations, and edge runtime support compared to Prisma.", img: "dev11", tags: ["orm", "typescript", "database"], author: "Drizzle Team" },
      { title: "Tauri 2.0 Lets You Build Native iOS & Android Apps with Web Tech", desc: "The Rust-powered alternative to Electron now targets mobile platforms, creating tiny native apps from web code with far smaller bundle sizes.", img: "dev12", tags: ["tauri", "rust", "mobile"], author: "Tauri Team" },
    ],
    market: [
      { title: "NVIDIA Market Cap Hits $3 Trillion — Surpasses Apple Briefly", desc: "AI chip demand propels NVIDIA to briefly become the world's most valuable company, with data center GPU revenue up 400% year-over-year.", img: "market1", tags: ["nvidia", "stocks", "ai"], author: "Bloomberg" },
      { title: "Fed Cuts Rates 3 Times in 2025: Tech Stocks Rally 25%", desc: "Federal Reserve's rate-cutting cycle boosts growth stocks significantly, with Nasdaq hitting new all-time highs and tech ETFs seeing record inflows.", img: "market2", tags: ["fed", "rates", "nasdaq"], author: "CNBC" },
      { title: "OpenAI Valued at $157B in Latest Funding Round", desc: "The ChatGPT maker raises $6.6B at a massive valuation, making it one of the most valuable private companies in history ahead of a potential IPO.", img: "market3", tags: ["openai", "funding", "ipo"], author: "Financial Times" },
      { title: "Databricks IPO Expected in 2025 at $55B Valuation", desc: "The AI data platform company files for an IPO, capitalizing on surging enterprise demand for data analytics and AI model training infrastructure.", img: "market4", tags: ["databricks", "ipo", "data"], author: "Wall Street Journal" },
      { title: "Elon Musk's xAI Raises $6B to Challenge OpenAI With Grok", desc: "The Grok AI company secures funding from top VCs to hire researchers, build Colossus supercomputer, and expand its real-time AI capabilities.", img: "market5", tags: ["xai", "grok", "musk"], author: "The Information" },
      { title: "Microsoft Azure AI Revenue Surpasses $10B Run Rate", desc: "Azure's AI services including Copilot, OpenAI partnership, and AI infrastructure products drive unprecedented cloud growth for Microsoft.", img: "market6", tags: ["microsoft", "azure", "cloud"], author: "Microsoft Investor" },
      { title: "Amazon AWS Launches 50 AI Services in Single Year — Record High", desc: "AWS dominates enterprise AI adoption with services from Bedrock to SageMaker, capturing 31% of the global cloud AI market.", img: "market7", tags: ["amazon", "aws", "cloud"], author: "AWS Blog" },
      { title: "Crypto Market Cap Returns to $3 Trillion All-Time High", desc: "Total crypto market capitalization returns to peak levels, driven by Bitcoin ETF inflows, DeFi growth, and renewed institutional interest.", img: "market8", tags: ["crypto", "market-cap", "bull"], author: "CoinMarketCap" },
      { title: "AI Startups Raise Record $100B in 2024 — Doubling 2023 Pace", desc: "Venture capital floods into AI companies at an unprecedented rate, with foundation model companies, AI infrastructure, and vertical AI apps all booming.", img: "market9", tags: ["vc", "startups", "investment"], author: "Crunchbase" },
      { title: "Apple Stock Jumps 15% After Vision Pro Sales Beat Expectations", desc: "Better-than-expected adoption of Apple's spatial computing platform and strong services revenue growth push AAPL to new all-time highs.", img: "market10", tags: ["apple", "aapl", "vision-pro"], author: "Barron's" },
      { title: "Google's AI Overhaul Pays Off: Alphabet Revenue Up 30% YoY", desc: "Alphabet beats Wall Street estimates across ads, cloud, and hardware as Google's AI investments begin generating substantial returns.", img: "market11", tags: ["google", "alphabet", "earnings"], author: "Reuters" },
      { title: "SoftBank Vision Fund 3 Targets $100B for AI Investments", desc: "Masayoshi Son announces third fund focused exclusively on artificial general intelligence companies, robotics, and AI infrastructure providers.", img: "market12", tags: ["softbank", "vc", "agi"], author: "Nikkei Asia" },
    ],
  };

  function getMockArticles(category = 'tech', count = 12, page = 1) {
    const pool = MOCK[category] || MOCK.tech;
    const start = ((page - 1) * count) % pool.length;
    const results = [];
    for (let i = 0; i < count; i++) {
      const item = pool[(start + i) % pool.length];
      const seed = item.img;
      results.push({
        id: `mock_${category}_${page}_${i}`,
        title: item.title,
        description: item.desc,
        url: '#',
        image: `https://picsum.photos/seed/${seed}/800/450`,
        source: getCategorySource(category),
        sourceColor: getCategoryColor(category),
        author: item.author,
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        readTime: `${Math.floor(Math.random() * 6) + 2} min read`,
        category: category,
        tags: item.tags,
        isMock: true,
      });
    }
    return results;
  }

  function getCategorySource(cat) {
    const map = { ai: 'AI Weekly', crypto: 'CryptoDesk', tech: 'TechPulse', dev: 'DevDaily', market: 'MarketWatch' };
    return map[cat] || 'WorldOfAI';
  }

  function getCategoryColor(cat) {
    const map = { ai: '#8b5cf6', crypto: '#f59e0b', tech: '#3b82f6', dev: '#10b981', market: '#ef4444' };
    return map[cat] || '#6366f1';
  }

  // ─── Provider registry (for progressive rendering) ────────────────────────
  // Returns an array of zero-argument async functions, one per source.
  // app.js calls them concurrently and renders each batch as it resolves.
  function getProviders(category, page, pageSize) {
    const half  = Math.ceil(pageSize / 2);
    const third = Math.ceil(pageSize / 3);
    const providers = [];

    // Hacker News — dedicated category
    if (category === 'hn') {
      providers.push(() => fetchHackerNews('', page, pageSize));
      return providers;
    }

    if (category === 'ai' || category === 'general') {
      providers.push(() => fetchHackerNews('machine learning OR LLM OR GPT OR artificial intelligence', page, half));
      providers.push(() => fetchDevTo('ai', page, third));
      providers.push(() => fetchNewsAPI('artificial intelligence OR machine learning', 'ai', page, third));
    }

    if (category === 'tech' || category === 'general') {
      providers.push(() => fetchHackerNews('tech OR software OR startup', page, half));
      providers.push(() => fetchDevTo('webdev', page, third));
      providers.push(() => fetchNewsAPI('technology OR software', 'tech', page, third));
    }

    if (category === 'crypto' || category === 'general') {
      providers.push(() => fetchCryptoPanic('trending', page));
      providers.push(() => fetchCoinGeckoNews(page));
      if (category === 'crypto') {
        providers.push(() => fetchHackerNews('bitcoin OR ethereum OR crypto OR blockchain', page, half));
      }
    }

    if (category === 'dev') {
      providers.push(() => fetchHackerNews('show hn OR ask hn OR programming OR javascript OR typescript OR open source', page, half));
      providers.push(() => fetchDevTo('programming', page, half));
      providers.push(() => fetchDevTo('javascript', page, half));
    }

    if (category === 'market') {
      providers.push(() => fetchCoinGeckoNews(page));
      providers.push(() => fetchNewsAPI('stock market OR investing OR finance', 'market', page, half));
      providers.push(() => fetchHackerNews('stocks OR investing OR IPO OR fintech OR finance', page, half));
    }

    return providers;
  }

  function _mockFallbackCat(category) {
    return (category in MOCK) ? category : 'tech';
  }
  async function fetchArticles(category = 'general', page = 1, pageSize = CONFIG.PAGE_SIZE) {
    const providers = getProviders(category, page, pageSize);
    const results = await Promise.allSettled(providers.map(fn => fn()));
    let articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value || []);

    // Deduplicate by title
    const seen = new Set();
    articles = articles.filter(a => {
      if (!a || !a.title || seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    // Fall back to mock data when no live results
    if (articles.length < 4) {
      articles = getMockArticles(_mockFallbackCat(category), pageSize, page);
    } else {
      articles = articles.slice(0, pageSize);
    }

    return articles;
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  async function searchArticles(query, page = 1) {
    const q = query.toLowerCase();
    let results = [];

    const [hn, devto, newsapi] = await Promise.allSettled([
      fetchHackerNews(query, page, 12),
      fetchDevTo(q.replace(/\s+/g, '-'), page, 10),
      fetchNewsAPI(query, 'general', page, 10),
    ]);

    if (hn.status     === 'fulfilled') results.push(...hn.value);
    if (devto.status  === 'fulfilled') results.push(...devto.value);
    if (newsapi.status === 'fulfilled') results.push(...newsapi.value);

    if (results.length < 4) {
      const allMock = Object.entries(MOCK).flatMap(([cat, items]) =>
        items
          .filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)))
          .map((a, i) => ({
            id: `mock_search_${cat}_${i}`,
            title: a.title,
            description: a.desc,
            url: '#',
            image: `https://picsum.photos/seed/${a.img}/800/450`,
            source: getCategorySource(cat),
            sourceColor: getCategoryColor(cat),
            author: a.author,
            publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            readTime: `${Math.floor(Math.random() * 6) + 2} min read`,
            category: cat,
            tags: a.tags,
            isMock: true,
          }))
      );
      results = allMock.length > 0 ? allMock : getMockArticles('tech', 12, 1);
    }

    return results;
  }

  return {
    fetchDevTo,
    fetchCryptoPanic,
    fetchCoinGeckoNews,
    fetchNewsAPI,
    fetchHackerNews,
    getMockArticles,
    mockFallbackCat: _mockFallbackCat,
    getProviders,
    fetchArticles,
    searchArticles,
  };
})();
