import "server-only";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  refresh?: Promise<void>;
};

const MAX_ENTRIES = Number(process.env.EXPLORER_SERVER_CACHE_MAX_ENTRIES || 500);

declare global {
  // eslint-disable-next-line no-var
  var __mintlayerExplorerServerCache:
    | {
        store: Map<string, CacheEntry<unknown>>;
        inflight: Map<string, Promise<unknown>>;
      }
    | undefined;
}

// Next.js compiles pages and route handlers as separate bundles with separate
// module instances. Persisting the cache on globalThis (same pattern as the
// pg pool in lib/postgres.ts) makes every bundle in the server process share
// one cache, so a snapshot built for a page render is reused by API routes.
const shared =
  globalThis.__mintlayerExplorerServerCache ??
  (globalThis.__mintlayerExplorerServerCache = {
    store: new Map<string, CacheEntry<unknown>>(),
    inflight: new Map<string, Promise<unknown>>(),
  });

const store = shared.store;
const inflight = shared.inflight;

function evictIfNeeded() {
  const oldestKeys = Array.from(store.keys());
  for (const key of oldestKeys) {
    if (store.size <= MAX_ENTRIES) {
      break;
    }
    store.delete(key);
  }
}

/**
 * In-process TTL cache with stale-while-revalidate and in-flight de-duplication.
 *
 * - Fresh entry: returned immediately, no load.
 * - Stale entry: stale value is returned right away while a single background
 *   refresh runs; concurrent callers share the same refresh promise.
 * - Missing entry: the load runs once and concurrent callers await the same
 *   promise, so a burst of renders triggers a single upstream fetch.
 *
 * The cache is per-process (per pod), which is safe for a block explorer:
 * every pod independently converges on the same upstream data within the TTL.
 */
export async function withCache<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.value;
  }

  if (entry) {
    if (!entry.refresh) {
      const refresh = load()
        .then((value) => {
          store.set(key, { value, expiresAt: Date.now() + ttlMs });
        })
        .catch((error) => {
          console.warn(`[server-cache] background refresh failed for "${key}":`, error instanceof Error ? error.message : error);
        })
        .finally(() => {
          if (inflight.get(key) === refresh) {
            inflight.delete(key);
          }
          const current = store.get(key) as CacheEntry<T> | undefined;
          if (current === entry) {
            entry.refresh = undefined;
          }
        });
      entry.refresh = refresh;
      inflight.set(key, refresh);
    }
    return entry.value;
  }

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const loadPromise = load()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      evictIfNeeded();
      return value;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, loadPromise as Promise<unknown>);
  return loadPromise;
}
