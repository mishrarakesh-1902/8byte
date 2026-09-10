interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 15): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): { data: T | null; isStale: boolean; ageMs: number } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { data: null, isStale: true, ageMs: 0 };
    }

    const ageMs = Date.now() - entry.timestamp;
    const isStale = ageMs > entry.ttlMs;

    return {
      data: entry.data as T,
      isStale,
      ageMs,
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global singleton cache across API requests in Node server process
const globalCache = (global as any).__portfolio_memory_cache__ || new MemoryCache();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__portfolio_memory_cache__ = globalCache;
}

export const cache = globalCache as MemoryCache;
