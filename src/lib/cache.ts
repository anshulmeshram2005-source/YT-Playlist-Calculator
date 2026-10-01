/**
 * Simple in-memory LRU cache for YouTube API results
 * In production, replace with Cloudflare KV or similar
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      // Delete oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global cache instances (TTL in ms)
const ONE_HOUR = 60 * 60 * 1000;
const SIX_HOURS = 6 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const playlistCache = new LRUCache<any>(200);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const videoCache = new LRUCache<any>(1000);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const channelCache = new LRUCache<any>(100);

export const TTL = { ONE_HOUR, SIX_HOURS, ONE_DAY };

/** Build a cache key for a playlist request */
export function playlistCacheKey(id: string, start: number, end: number): string {
  return `playlist:${id}:${start}:${end}`;
}

/** Build a cache key for a video */
export function videoCacheKey(id: string): string {
  return `video:${id}`;
}
