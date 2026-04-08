// WorldOfAI Tech - Main Application Logic

const App = (() => {
  // ─── State ────────────────────────────────────────────────────────────────
  let currentCategory = 'general';
  let currentPage = 1;
  let isLoading = false;
  let hasMore = true;
  let searchQuery = '';
  let featuredArticle = null;
  let observer = null;

  const CATEGORIES = [
    { id: 'general', label: 'Home', icon: '🏠' },
    { id: 'tech', label: 'Tech', icon: '💻' },
    { id: 'ai', label: 'AI', icon: '🤖' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'dev', label: 'Dev', icon: '⚡' },
    { id: 'market', label: 'Markets', icon: '📈' },
  ];

  const BREAKING_NEWS = [
    "🔴 BREAKING: GPT-5 launches with unprecedented reasoning capabilities",
    "⚡ Bitcoin crosses $100K milestone for first time in history",
    "🚀 NVIDIA market cap briefly surpasses Apple at $3 trillion",
    "🤖 OpenAI raises $6.6B funding round, valued at $157 billion",
    "💡 Google Willow quantum chip shatters computational records",
    "🌐 Meta's Llama 4 goes fully open source with multimodal support",
    "📱 Apple Intelligence rolling out to 2 billion devices worldwide",
    "🔗 Ethereum ETF sees $2B inflows in first week of trading",
  ];

  const TRENDING_TOPICS = [
    { tag: 'GPT-5', count: '24.3K' },
    { tag: 'Bitcoin ETF', count: '18.7K' },
    { tag: 'NVIDIA AI', count: '15.2K' },
    { tag: 'React 19', count: '12.8K' },
    { tag: 'Quantum Computing', count: '9.4K' },
    { tag: 'Solana DeFi', count: '8.1K' },
    { tag: 'Apple Vision Pro', count: '7.6K' },
    { tag: 'TypeScript 5.5', count: '6.9K' },
    { tag: 'Anthropic Claude', count: '6.2K' },
    { tag: 'Waymo Robotaxi', count: '5.8K' },
  ];

  // ─── Utils ────────────────────────────────────────────────────────────────
  function timeAgo(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return 'Recently';
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getSavedArticles() {
    try { return JSON.parse(localStorage.getItem('worlofai_saved') || '[]'); }
    catch { return []; }
  }

  function saveArticle(article) {
    const saved = getSavedArticles();
    const idx = saved.findIndex(a => a.id === article.id);
    if (idx >= 0) { saved.splice(idx, 1); }
    else { saved.unshift(article); }
    localStorage.setItem('worlofai_saved', JSON.stringify(saved.slice(0, 50)));
    updateSavedCount();
    return idx < 0;
  }

  function isArticleSaved(id) {
    return getSavedArticles().some(a => a.id === id);
  }

  function updateSavedCount() {
    const count = getSavedArticles().length;
    document.querySelectorAll('.saved-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── Theme ────────────────────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('worlofai_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('worlofai_theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // ─── Ticker ───────────────────────────────────────────────────────────────
  function initTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    const items = [...BREAKING_NEWS, ...BREAKING_NEWS];
    track.innerHTML = items.map(t => `<span class="ticker-item">${escapeHtml(t)}</span>`).join('');
  }

  // ─── Trending Sidebar ─────────────────────────────────────────────────────
  function renderTrending() {
    const el = document.getElementById('trendingList');
    if (!el) return;
    el.innerHTML = TRENDING_TOPICS.map((t, i) => `
      <div class="trending-item" onclick="App.searchByTag('${escapeHtml(t.tag)}')">
        <span class="trending-rank">${i + 1}</span>
        <div class="trending-info">
          <span class="trending-tag">#${escapeHtml(t.tag.replace(/ /g, ''))}</span>
          <span class="trending-count">${t.count} posts</span>
        </div>
      </div>`).join('');
  }

  // ─── Article Cards ────────────────────────────────────────────────────────
  function createArticleCard(article, isFeatured = false) {
    const saved = isArticleSaved(article.id);
    const time = timeAgo(article.publishedAt);
    const tags = (article.tags || []).slice(0, 2).map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('');
    const safeArticle = escapeHtml(JSON.stringify(article)).replace(/'/g, '&#39;');

    if (isFeatured) {
      return `
        <article class="featured-card" onclick="App.openArticle('${article.id}')" data-id="${article.id}">
          <div class="featured-image" style="background-image:url('${article.image}')">
            <div class="featured-overlay">
              <div class="featured-meta">
                <span class="source-badge" style="background:${article.sourceColor}">${escapeHtml(article.source)}</span>
                <span class="featured-label">Featured</span>
              </div>
              <h2 class="featured-title">${escapeHtml(article.title)}</h2>
              <p class="featured-desc">${escapeHtml(article.description)}</p>
              <div class="article-footer">
                <span class="article-author">✍ ${escapeHtml(article.author)}</span>
                <span class="article-time">⏱ ${time}</span>
                <span class="article-read">${escapeHtml(article.readTime)}</span>
              </div>
            </div>
          </div>
        </article>`;
    }

    return `
      <article class="article-card" onclick="App.openArticle('${article.id}')" data-id="${article.id}">
        <div class="card-image-wrap">
          <img class="card-image" src="${article.image}" alt="${escapeHtml(article.title)}" loading="lazy" onerror="this.src='https://picsum.photos/seed/fallback${Math.floor(Math.random()*999)}/800/450'">
          <div class="card-image-overlay"></div>
          <span class="source-badge" style="background:${article.sourceColor}">${escapeHtml(article.source)}</span>
        </div>
        <div class="card-body">
          <div class="card-tags">${tags}</div>
          <h3 class="card-title">${escapeHtml(article.title)}</h3>
          <p class="card-desc">${escapeHtml(article.description)}</p>
          <div class="card-footer">
            <div class="card-meta">
              <span class="card-author">${escapeHtml(article.author)}</span>
              <span class="card-dot">·</span>
              <span class="card-time">${time}</span>
              <span class="card-dot">·</span>
              <span class="card-readtime">${escapeHtml(article.readTime)}</span>
            </div>
            <div class="card-actions">
              <button class="btn-action btn-save ${saved ? 'saved' : ''}" onclick="event.stopPropagation();App.toggleSave('${article.id}')" title="${saved ? 'Unsave' : 'Save'}">
                ${saved ? '🔖' : '🔖'}
              </button>
              <button class="btn-action btn-share" onclick="event.stopPropagation();App.shareById('${article.id}')" title="Share">
                📤
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function createSkeleton() {
    return `<div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-tag"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-title short"></div>
        <div class="skeleton skeleton-desc"></div>
        <div class="skeleton skeleton-desc short"></div>
        <div class="skeleton skeleton-meta"></div>
      </div>
    </div>`;
  }

  function createAdSlot(type = 'infeed') {
    return `<div class="ad-slot ad-${type}">
      <!-- ADSENSE: IN-FEED AD 300x250 - INSERT YOUR AD CODE HERE -->
      <!-- Replace this div with your Google AdSense ad unit code -->
      <span class="ad-label">Advertisement</span>
    </div>`;
  }

  // ─── Article Store ────────────────────────────────────────────────────────
  const articleStore = new Map();

  function storeArticle(article) {
    articleStore.set(article.id, article);
  }

  function getArticle(id) {
    return articleStore.get(id);
  }

  // ─── Feed Rendering ───────────────────────────────────────────────────────
  function showSkeletons(count = 6) {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;
    grid.insertAdjacentHTML('beforeend', Array(count).fill(createSkeleton()).join(''));
  }

  function removeSkeletons() {
    document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
  }

  async function loadArticles(reset = false) {
    if (isLoading) return;
    isLoading = true;

    const grid = document.getElementById('articlesGrid');
    const spinner = document.getElementById('loadingSpinner');
    if (!grid) { isLoading = false; return; }

    if (reset) {
      grid.innerHTML = '';
      currentPage = 1;
      hasMore = true;
      featuredArticle = null;
      articleStore.clear();
    }

    showSkeletons(6);
    if (spinner) spinner.style.display = 'flex';

    try {
      let articles;
      if (searchQuery) {
        articles = await API.searchArticles(searchQuery, currentPage);
      } else {
        articles = await API.fetchArticles(currentCategory, currentPage, CONFIG.PAGE_SIZE);
      }

      removeSkeletons();
      if (spinner) spinner.style.display = 'none';

      if (!articles || articles.length === 0) {
        hasMore = false;
        if (currentPage === 1) {
          grid.innerHTML = `<div class="empty-state"><span class="empty-icon">📰</span><p>No articles found. Try a different category.</p></div>`;
        }
        isLoading = false;
        return;
      }

      // First load: set featured article
      if (currentPage === 1 && reset && articles.length > 0) {
        featuredArticle = articles[0];
        storeArticle(featuredArticle);
        const hero = document.getElementById('heroSection');
        if (hero) {
          hero.innerHTML = createArticleCard(featuredArticle, true);
          hero.style.display = 'block';
        }
        articles = articles.slice(1);
      }

      articles.forEach((article, i) => {
        storeArticle(article);
        grid.insertAdjacentHTML('beforeend', createArticleCard(article));
        // Insert ad slot after every 6 articles
        if ((i + 1) % 6 === 0) {
          grid.insertAdjacentHTML('beforeend', createAdSlot('infeed'));
        }
      });

      hasMore = articles.length >= CONFIG.PAGE_SIZE - 1;
      currentPage++;

    } catch (err) {
      removeSkeletons();
      if (spinner) spinner.style.display = 'none';
      console.error('Load error:', err);
    }

    isLoading = false;
  }

  // ─── Article Modal ────────────────────────────────────────────────────────
  function openArticle(id) {
    const article = getArticle(id);
    if (!article) return;

    const modal = document.getElementById('articleModal');
    const content = document.getElementById('articleModalContent');
    if (!modal || !content) return;

    const saved = isArticleSaved(id);
    const time = timeAgo(article.publishedAt);
    const tags = (article.tags || []).map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('');

    content.innerHTML = `
      <div class="modal-article">
        <img class="modal-article-image" src="${article.image}" alt="${escapeHtml(article.title)}" onerror="this.style.display='none'">
        <div class="modal-article-body">
          <div class="modal-article-meta">
            <span class="source-badge" style="background:${article.sourceColor}">${escapeHtml(article.source)}</span>
            <span class="modal-time">${time}</span>
            <span class="modal-readtime">${escapeHtml(article.readTime)}</span>
          </div>
          <h2 class="modal-article-title">${escapeHtml(article.title)}</h2>
          <p class="modal-article-author">By ${escapeHtml(article.author)}</p>
          <p class="modal-article-desc">${escapeHtml(article.description)}</p>
          <div class="modal-article-tags">${tags}</div>
          <div class="modal-article-actions">
            <button class="btn-primary" onclick="window.open('${escapeHtml(article.url)}','_blank')">
              Read Full Article →
            </button>
            <button class="btn-secondary btn-save-modal ${saved ? 'saved' : ''}" onclick="App.toggleSave('${id}');this.classList.toggle('saved');this.textContent=App.isArticleSaved('${id}')?'🔖 Saved':'🔖 Save'">
              ${saved ? '🔖 Saved' : '🔖 Save'}
            </button>
            <button class="btn-secondary" onclick="App.shareById('${id}')">
              📤 Share
            </button>
          </div>
          ${article.isMock ? `<div class="mock-notice">💡 This is sample content. Add API keys in js/config.js to load live articles.</div>` : ''}
        </div>
      </div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ─── Search Modal ─────────────────────────────────────────────────────────
  function openSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('searchInput');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function closeSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.remove('active');
    if (!document.getElementById('articleModal')?.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  function performSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    searchQuery = q;
    closeSearch();
    setCategory('general', false);
    loadArticles(true);
    const title = document.getElementById('feedTitle');
    if (title) title.textContent = `Search: "${q}"`;
  }

  function searchByTag(tag) {
    const input = document.getElementById('searchInput');
    if (input) input.value = tag;
    searchQuery = tag;
    setCategory('general', false);
    loadArticles(true);
    const title = document.getElementById('feedTitle');
    if (title) title.textContent = `#${tag}`;
  }

  function clearSearch() {
    searchQuery = '';
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
  }

  // ─── Category Routing ─────────────────────────────────────────────────────
  function setCategory(id, clearSearchFlag = true) {
    currentCategory = id;
    if (clearSearchFlag) clearSearch();

    // Update tab active state
    document.querySelectorAll('.cat-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === id);
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.cat === id);
    });

    // Update URL
    const url = new URL(window.location);
    if (id === 'general') url.searchParams.delete('category');
    else url.searchParams.set('category', id);
    history.pushState({}, '', url);

    // Update feed title
    const cat = CATEGORIES.find(c => c.id === id);
    const title = document.getElementById('feedTitle');
    if (title && cat) title.textContent = `${cat.icon} ${cat.label} News`;

    loadArticles(true);
  }

  function initRouting() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && CATEGORIES.find(c => c.id === cat)) {
      currentCategory = cat;
    }
  }

  // ─── Infinite Scroll ──────────────────────────────────────────────────────
  function initInfiniteScroll() {
    const sentinel = document.getElementById('scrollSentinel');
    if (!sentinel) return;

    observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading && hasMore) {
        loadArticles(false);
      }
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
  }

  // ─── Back to Top ──────────────────────────────────────────────────────────
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ─── Share ────────────────────────────────────────────────────────────────
  async function share(url, title) {
    const shareUrl = url === '#' ? window.location.href : url;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (e) { /* fallback */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Could not copy link.');
    }
  }

  async function shareById(id) {
    const article = getArticle(id);
    if (!article) return;
    await share(article.url, article.title);
  }

  function toggleSave(id) {
    const article = getArticle(id);
    if (!article) return;
    const wasSaved = saveArticle(article);
    // Update all save buttons for this article
    document.querySelectorAll(`[data-id="${id}"] .btn-save`).forEach(btn => {
      btn.classList.toggle('saved', wasSaved);
    });
    showToast(wasSaved ? '🔖 Article saved!' : 'Article removed from saved');
    return wasSaved;
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  // ─── Saved Articles Panel ─────────────────────────────────────────────────
  function openSavedPanel() {
    const modal = document.getElementById('savedModal');
    const list = document.getElementById('savedList');
    if (!modal || !list) return;

    const saved = getSavedArticles();
    list.innerHTML = saved.length === 0
      ? '<p class="empty-saved">No saved articles yet. Click 🔖 on any article to save it.</p>'
      : saved.map(a => `
          <div class="saved-item" onclick="App.openArticle('${a.id}')">
            <img class="saved-thumb" src="${a.image}" alt="">
            <div class="saved-info">
              <p class="saved-title">${escapeHtml(a.title)}</p>
              <span class="saved-source" style="color:${a.sourceColor}">${escapeHtml(a.source)}</span>
            </div>
            <button class="btn-remove-saved" onclick="event.stopPropagation();App.toggleSave('${a.id}');App.openSavedPanel()">✕</button>
          </div>`).join('');

    saved.forEach(a => storeArticle(a));
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSavedPanel() {
    const modal = document.getElementById('savedModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ─── Category Tabs ────────────────────────────────────────────────────────
  function renderCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    if (!tabs) return;
    tabs.innerHTML = CATEGORIES.map(c => `
      <button class="cat-tab ${c.id === currentCategory ? 'active' : ''}" data-cat="${c.id}" onclick="App.setCategory('${c.id}')">
        <span class="tab-icon">${c.icon}</span> ${c.label}
      </button>`).join('');
  }

  function renderNavLinks() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    nav.innerHTML = CATEGORIES.map(c => `
      <a class="nav-link ${c.id === currentCategory ? 'active' : ''}" data-cat="${c.id}" href="#" onclick="event.preventDefault();App.setCategory('${c.id}')">
        ${c.label}
      </a>`).join('');
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initTheme();
    initRouting();
    initTicker();
    renderTrending();
    renderCategoryTabs();
    renderNavLinks();
    updateSavedCount();
    initInfiniteScroll();
    initBackToTop();
    loadArticles(true);

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeArticleModal();
        closeSearch();
        closeSavedPanel();
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        openSearch();
      }
    });

    // Mobile nav toggle
    const menuBtn = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        menuBtn.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
      });
    }

    // Search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') performSearch();
      });
    }

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Scroll navbar shadow
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  return {
    init,
    toggleTheme,
    setCategory,
    openArticle,
    closeArticleModal,
    openSearch,
    closeSearch,
    performSearch,
    searchByTag,
    toggleSave,
    isArticleSaved,
    share,
    shareById,
    openSavedPanel,
    closeSavedPanel,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
