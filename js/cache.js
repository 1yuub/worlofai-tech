// WorldOfAI Tech - Cache & Fetch Utility
// Provides: TTL caching (memory + localStorage), stale-while-revalidate,
//           per-request timeout, exponential-backoff retry, in-flight coalescing.

const Cache = (() => {
  const MEMORY = new Map();   // key -> { data, ts }
  const LS_PREFIX = 'wai_c_';
  const STALE_FACTOR = 3;     // stale data usable for STALE_FACTOR × TTL

  // ── In-memory store ───────────────────────────────────
  function memGet(key) { return MEMORY.get(key) || null; }
  function memSet(key, data) { MEMORY.set(key, { data, ts: Date.now() }); }

  // ── localStorage store ────────────────────────────────
  function lsGet(key) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function lsSet(key, data, ttl) {
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now(), ttl }));
    } catch {
      // Storage quota exceeded — purge old cache entries and retry once
      _purgeLsCache();
      try { localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now(), ttl })); } catch {}
    }
  }

  function _purgeLsCache() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(LS_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  // ── Age helpers ───────────────────────────────────────
  function isFresh(entry, ttl) {
    return !!(entry && entry.data && (Date.now() - entry.ts) < ttl);
  }

  function isUsable(entry, ttl) {
    // Stale but still usable (within STALE_FACTOR × TTL)
    return !!(entry && entry.data && (Date.now() - entry.ts) < ttl * STALE_FACTOR);
  }

  // ── In-flight coalescing ──────────────────────────────
  const INFLIGHT = new Map(); // key -> Promise<data>

  /**
   * fetchWithCache(key, fetchFn, opts)
   *
   * Strategy (in order):
   *   1. Return memory-fresh data immediately.
   *   2. Promote localStorage-fresh data to memory and return it.
   *   3. Return stale data immediately AND kick off a background refresh
   *      (stale-while-revalidate) — the caller gets fast content.
   *   4. If another request for the same key is already in-flight, either
   *      return stale data right away or await the shared promise.
   *   5. Otherwise fetch (with timeout + exponential-backoff retry).
   *
   * @param {string}   key
   * @param {Function} fetchFn  async (signal: AbortSignal) => any
   * @param {object}   [opts]
   *   @param {number} [opts.ttl=300000]   TTL in ms (default 5 min)
   *   @param {number} [opts.timeout=8000] Per-attempt abort timeout in ms
   *   @param {number} [opts.retries=1]    Extra retry attempts (0 = try once)
   */
  async function fetchWithCache(key, fetchFn, opts = {}) {
    const ttl     = opts.ttl     ?? (typeof CONFIG !== 'undefined' ? CONFIG.CACHE_TTL : 300000);
    const timeout = opts.timeout ?? 8000;
    const retries = opts.retries ?? 1;

    // 1. Memory cache — fresh
    const memEntry = memGet(key);
    if (isFresh(memEntry, ttl)) return memEntry.data;

    // 2. localStorage cache — fresh
    const lsEntry = lsGet(key);
    if (isFresh(lsEntry, ttl)) {
      memSet(key, lsEntry.data);
      return lsEntry.data;
    }

    // 3. Determine stale fallback
    const stale = (isUsable(memEntry, ttl) && memEntry.data)
               || (isUsable(lsEntry,  ttl) && lsEntry.data)
               || null;

    // 4. Coalesce in-flight requests
    if (INFLIGHT.has(key)) {
      return stale !== null ? stale : INFLIGHT.get(key);
    }

    // 5. Fire request
    const promise = _fetchWithRetry(key, fetchFn, ttl, timeout, retries);
    INFLIGHT.set(key, promise);
    promise.catch(() => {}).finally(() => INFLIGHT.delete(key));

    // Stale-while-revalidate: return stale data immediately
    if (stale !== null) return stale;
    return promise;
  }

  async function _fetchWithRetry(key, fetchFn, ttl, timeout, retries) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, Math.min(500 * (1 << (attempt - 1)), 4000)));
      }
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), timeout);
      try {
        const data = await fetchFn(ctrl.signal);
        clearTimeout(tid);
        memSet(key, data);
        lsSet(key, data, ttl);
        return data;
      } catch (e) {
        clearTimeout(tid);
        lastErr = e.name === 'AbortError'
          ? new Error(`Request timed out (${timeout}ms): ${key}`)
          : e;
      }
    }
    throw lastErr;
  }

  return { fetchWithCache, memSet, lsSet };
})();
