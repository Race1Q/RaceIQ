// Lightweight request cache with TTL, localStorage backup, and SWR-style background refresh
type CacheEntry<T> = { t: number; v: T };

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 30_000; // 30 seconds
const STORAGE_PREFIX = 'rc:';

export async function fetchCached<T>(
  key: string,
  url: string,
  init: RequestInit = {},
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();

  const memHit = memoryCache.get(key);
  if (memHit && now - memHit.t < ttlMs) return memHit.v as T;

  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (now - parsed.t < ttlMs) {
        memoryCache.set(key, parsed);
        // Kick background refresh
        queueMicrotask(() => refreshInBackground<T>(key, url, init));
        return parsed.v;
      }
    }
  } catch {}

  // Foreground fetch without timeout - let it wait for natural response
  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = (await res.json()) as T;
    const entry = { t: now, v: data };
    memoryCache.set(key, entry);
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry)); } catch {}
    // Background refresh to keep warm
    queueMicrotask(() => refreshInBackground<T>(key, url, init));
    return data;
  } catch (error) {
    // Re-throw the error so it can be handled by the calling code
    throw error;
  }
}

async function refreshInBackground<T>(key: string, url: string, init: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return;
    const data = (await res.json()) as T;
    const entry = { t: Date.now(), v: data } as CacheEntry<T>;
    memoryCache.set(key, entry);
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry)); } catch {}
  } catch {}
}


